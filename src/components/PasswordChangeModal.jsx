import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, X as XIcon, AlertCircle } from 'lucide-react';
import Button from './Button';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

export default function PasswordChangeModal({ isOpen, onClose, passwordWarning }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Password strength validation
  const validatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const allMet = Object.values(requirements).every(req => req === true);
    
    return { requirements, allMet };
  };

  const passwordStrength = validatePasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!passwordStrength.allMet) {
      toast.error('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        toast.error(data.message || 'Failed to change password');
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(error => toast.error(error));
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-[#7B3F00]">Change Password</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Password Expiry Warning */}
          {passwordWarning && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 font-medium">
                  {passwordWarning.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Password must contain:
                  </p>
                  <div className="space-y-1">
                    <RequirementItem
                      met={passwordStrength.requirements.length}
                      text="At least 8 characters"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.uppercase}
                      text="One uppercase letter (A-Z)"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.lowercase}
                      text="One lowercase letter (a-z)"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.number}
                      text="One number (0-9)"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.special}
                      text="One special character (!@#$%^&*)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <XIcon className="h-3 w-3 mr-1" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <Button
                type="submit"
                loading={loading}
                disabled={!passwordStrength.allMet || newPassword !== confirmPassword}
                className="flex-1"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper component for password requirement items
function RequirementItem({ met, text }) {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <Check className="h-3 w-3 text-green-600 mr-1 flex-shrink-0" />
      ) : (
        <XIcon className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-600'}>{text}</span>
    </div>
  );
}
