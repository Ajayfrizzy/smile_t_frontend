import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initCSRF } from './utils/api';

// Initialize CSRF token before rendering the app
initCSRF().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  // Render app anyway to show error state
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
