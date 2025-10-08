import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ staff_id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    
    setLoading(true);
    
    try {
      const response = await apiRequest('/staff/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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
      } else {
        // Handle different error responses
        let errorData = {};
        
        try {
          // Try to parse the error response
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = {};
        }
        
        const errorType = errorData?.type;
        const errorMessage = errorData?.error || errorData?.message || 'Invalid credentials';
        
        if (response.status === 401) {
          // Handle specific authentication errors based on type
          if (errorType === 'INVALID_STAFF_ID') {
            toast.error('🆔 Staff ID not found');
          } else if (errorType === 'INVALID_PASSWORD') {
            toast.error('🔒 Incorrect password');  
          } else {
            // Fallback for any other 401 errors
            toast.error('❌ Invalid Staff ID or password');
          }
        } else if (response.status === 403) {
          toast.error('🚫 Access denied. Your account may be inactive.');
        } else {
          toast.error(errorMessage || 'Invalid credentials');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFD700]/20 to-[#7B3F00]/20 animate-fade-in">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md animate-scale-in animate-delay-200">
        <h1 className="text-2xl font-bold text-[#7B3F00] mb-6 text-center">
          Staff Login
        </h1>
        
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
          
          <Button 
            type="submit" 
            loading={loading}
            className="w-full"
          >
            Login
          </Button>
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