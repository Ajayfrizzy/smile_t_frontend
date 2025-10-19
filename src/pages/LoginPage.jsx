import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ staff_id: '', password: '', two_factor_token: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.staff_id.trim()) {
      toast.error('📋 Please enter your Staff ID');
      return;
    }
    
    if (!form.password.trim()) {
      toast.error('🔑 Please enter your password');
      return;
    }
    
    if (form.password.length < 3) {
      toast.error('🔑 Password is too short');
      return;
    }
    
    if (requires2FA && !form.two_factor_token.trim()) {
      toast.error('🔐 Please enter your 2FA code');
      return;
    }
    
    setLoading(true);
    
    try {
      const loginData = {
        staff_id: form.staff_id,
        password: form.password,
      };
      
      // Add 2FA token if required
      if (requires2FA && form.two_factor_token) {
        loginData.two_factor_token = form.two_factor_token;
      }
      
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Check if 2FA is required
        if (data.requires2FA) {
          setRequires2FA(true);
          toast.info('🔐 Please enter your 2FA code');
          setLoading(false);
          return;
        }
        
        // Check if password is expired
        if (data.passwordExpired) {
          setPasswordExpired(true);
          toast.error('⚠️ Your password has expired. Please change it.');
          setLoading(false);
          return;
        }
        
        // Store user info (no token in localStorage anymore - using HTTP-only cookies)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show password warning if needed
        if (data.passwordWarning) {
          setPasswordWarning(data.passwordWarning);
          setTimeout(() => setPasswordWarning(null), 10000); // Auto-dismiss after 10 seconds
        }
        
        toast.success('✅ Login successful!');
        
        // Redirect based on role
        switch (data.user.role) {
          case 'superadmin':
            navigate('/dashboard/superadmin');
            break;
          case 'supervisor':
            navigate('/dashboard/supervisor');
            break;
          case 'receptionist':
            navigate('/dashboard/receptionist');
            break;
          case 'barmen':
            navigate('/dashboard/barmen');
            break;
          default:
            navigate('/dashboard/superadmin');
        }
      } else if (response.status === 423 && data.locked) {
        // Account locked
        toast.error(`🔒 Account locked. ${data.message}`);
      } else {
        // Handle different error responses
        const errorMessage = data?.message || 'Invalid credentials';
        
        if (response.status === 401) {
          if (data.attemptsRemaining !== undefined) {
            toast.error(`❌ ${errorMessage}. ${data.attemptsRemaining} attempts remaining.`);
          } else {
            toast.error(`❌ ${errorMessage}`);
          }
        } else if (response.status === 403) {
          toast.error('🚫 Access denied. Your account may be inactive.');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('🌐 Connection error. Please check your internet connection.');
      } else {
        toast.error('⚠️ Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: form.password,
          new_password: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('✅ Password changed successfully! Please login again.');
        setPasswordExpired(false);
        setForm({ staff_id: form.staff_id, password: '', two_factor_token: '' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Password expired modal
  if (passwordExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFD700]/20 to-[#7B3F00]/20 animate-fade-in">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#7B3F00] mb-4 text-center">
            Password Expired
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Your password has expired. Please create a new password to continue.
          </p>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#7B3F00] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                required
                minLength={8}
              />
            </div>
            
            <Button 
              type="submit" 
              loading={loading}
              className="w-full"
            >
              Change Password
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFD700]/20 to-[#7B3F00]/20 animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md animate-scale-in animate-delay-200">
        <h1 className="text-2xl font-bold text-[#7B3F00] mb-6 text-center">
          Staff Login
        </h1>
        
        {/* Password Warning Banner */}
        {passwordWarning && (
          <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-800 font-medium">
                {passwordWarning.message}
              </p>
              <button
                onClick={() => setPasswordWarning(null)}
                className="text-xs text-orange-600 hover:text-orange-800 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-1">
              Staff ID
            </label>
            <input
              type="text"
              name="staff_id"
              value={form.staff_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              required
              disabled={requires2FA}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#7B3F00] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                required
                disabled={requires2FA}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* 2FA Token Input - Only show if 2FA is required */}
          {requires2FA && (
            <div className="pt-2 border-t">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-[#FFD700] mr-2" />
                <label className="block text-sm font-medium text-[#7B3F00]">
                  Two-Factor Authentication Code
                </label>
              </div>
              <input
                type="text"
                name="two_factor_token"
                value={form.two_factor_token}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-center text-lg tracking-widest"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Enter the code from your authenticator app
              </p>
            </div>
          )}
          
          <Button 
            type="submit" 
            loading={loading}
            className="w-full"
          >
            {requires2FA ? 'Verify & Login' : 'Login'}
          </Button>
          
          {requires2FA && (
            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setForm(prev => ({ ...prev, two_factor_token: '' }));
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Back to login
            </button>
          )}
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Use your staff credentials to access the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}