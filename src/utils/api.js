// API utility for making requests to the backend
// Remove trailing slash if present to avoid double slashes in URLs
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_BASE_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

// Store CSRF token
let csrfToken = null;

// Initialize CSRF token - call this on app startup
export const initCSRF = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      credentials: 'include', // Include cookies in request
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      console.log('CSRF token initialized');
    } else {
      console.warn('Failed to fetch CSRF token');
    }
  } catch (error) {
    console.error('Error initializing CSRF token:', error);
  }
};

// Get current CSRF token
export const getCSRFToken = () => csrfToken;

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add CSRF token for state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  const finalOptions = {
    ...options,
    headers,
    credentials: 'include', // Always include cookies
  };

  console.log(`API Request: ${method} ${url}`);
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