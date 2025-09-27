// API utility for making requests to the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  console.log(`API Request: ${finalOptions.method || 'GET'} ${url}`);
  if (finalOptions.body) {
    console.log('Request body:', finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default apiRequest;