import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verify authentication via HTTP-only cookie
        const response = await apiRequest('/api/auth/verify', {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.user) {
            // Update user in localStorage for quick access
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Check role-based access
            if (requiredRole && data.user.role !== requiredRole) {
              // Wrong role, redirect to appropriate dashboard
              navigate(`/dashboard/${data.user.role}`);
              return;
            }
            
            setIsAuthenticated(true);
          } else {
            // Not authenticated, redirect to login
            localStorage.removeItem('user');
            navigate('/staff');
          }
        } else {
          // Invalid/expired session, redirect to login
          localStorage.removeItem('user');
          navigate('/staff');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('user');
        navigate('/staff');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAuth();
  }, [navigate, requiredRole]);
  
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#7B3F00] mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return children;
}