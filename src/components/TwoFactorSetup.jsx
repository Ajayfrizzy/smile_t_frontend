import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Smartphone, Key, AlertCircle } from 'lucide-react';
import Button from './Button';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

export default function TwoFactorSetup({ isOpen, onClose, userRole, is2FAEnabled }) {
  const [step, setStep] = useState('idle'); // idle, setup, verify, enabled
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  // Set initial step based on 2FA status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('idle');
    }
  }, [isOpen]);

  // Only SuperAdmin can use 2FA
  if (userRole !== 'superadmin') {
    return null;
  }

  if (!isOpen) return null;

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/auth/setup-2fa', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCode(data.qrCode);
        setSecret(data.manualEntryKey);
        setStep('setup');
        toast.success('📱 Scan the QR code with your authenticator app');
      } else {
        toast.error(data.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('Setup 2FA error:', error);
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/auth/verify-2fa-setup', {
        method: 'POST',
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Fetch fresh user data to update 2FA status
        const verifyResponse = await apiRequest('/auth/verify', {
          method: 'GET',
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          if (verifyData.success && verifyData.user) {
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(verifyData.user));
          }
        }

        setStep('enabled');
        toast.success('✅ Two-factor authentication enabled successfully!');
        setVerificationCode('');
        
        // Reload page to reflect changes in UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      toast.error('Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    
    if (!disablePassword || !disableCode) {
      toast.error('Please enter your password and 2FA code');
      return;
    }

    if (disableCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({
          password: disablePassword,
          token: disableCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Fetch fresh user data to update 2FA status
        const verifyResponse = await apiRequest('/auth/verify', {
          method: 'GET',
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          if (verifyData.success && verifyData.user) {
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(verifyData.user));
          }
        }

        toast.success('✅ Two-factor authentication disabled');
        setDisablePassword('');
        setDisableCode('');
        setStep('idle');
        onClose();
        
        // Reload page to reflect changes in UI
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('idle');
    setQrCode(null);
    setSecret('');
    setVerificationCode('');
    setDisablePassword('');
    setDisableCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-[#FFD700] mr-2" />
            <h2 className="text-xl font-bold text-[#7B3F00]">
              Two-Factor Authentication
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Idle State - Choose to Enable or Disable */}
          {step === 'idle' && (
            <div className="space-y-4">
              {/* Current Status Badge */}
              <div className={`p-4 rounded-lg border ${is2FAEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className={`h-6 w-6 mr-2 ${is2FAEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Current Status</p>
                      <p className={`text-sm ${is2FAEnabled ? 'text-green-700' : 'text-gray-600'}`}>
                        2FA is currently {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    is2FAEnabled 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {is2FAEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What is Two-Factor Authentication?</p>
                    <p>
                      2FA adds an extra layer of security by requiring a code from your
                      authenticator app in addition to your password when logging in.
                    </p>
                  </div>
                </div>
              </div>

              {!is2FAEnabled && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Supported Authenticator Apps:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-[#FFD700]" />
                      Google Authenticator
                    </li>
                    <li className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-[#FFD700]" />
                      Microsoft Authenticator
                    </li>
                    <li className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-[#FFD700]" />
                      Authy
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                {!is2FAEnabled ? (
                  <Button
                    onClick={handleSetup2FA}
                    loading={loading}
                    className="w-full py-4 flex items-center justify-center"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Enable 2FA
                  </Button>
                ) : (
                  <button
                    onClick={() => setStep('disable')}
                    className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors text-sm font-medium"
                  >
                    Disable 2FA
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Setup State - Show QR Code */}
          {step === 'setup' && qrCode && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-1" />
                  Manual Entry Key:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-xs break-all text-gray-800">{secret}</code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use this key if you can't scan the QR code
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-[#7B3F00] mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('idle')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <Button type="submit" loading={loading} className="flex-1">
                    Verify & Enable
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Enabled State - Success */}
          {step === 'enabled' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2FA Enabled Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your account is now protected with two-factor authentication.
                  You'll need to enter a code from your authenticator app when logging in.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {/* Disable State - Require Password + 2FA Code */}
          {step === 'disable' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Warning</p>
                    <p>
                      Disabling 2FA will make your account less secure. You'll only need
                      your password to log in.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                    2FA Code
                  </label>
                  <input
                    type="text"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Enter the current code from your authenticator app
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('idle')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Disable 2FA
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
