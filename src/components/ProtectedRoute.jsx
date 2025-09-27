import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // No authentication, redirect to login
      navigate('/staff');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (requiredRole && userData.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        navigate(`/dashboard/${userData.role}`);
        return;
      }
    } catch (error) {
      // Invalid user data, redirect to login
      navigate('/staff');
      return;
    }
  }, [navigate, requiredRole]);
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
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