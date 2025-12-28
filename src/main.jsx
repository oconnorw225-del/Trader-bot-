import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { checkAuth, setupAuthInterceptor } from './utils/auth';

// Setup authentication interceptor for API calls
setupAuthInterceptor();

// Check authentication before mounting the app
const initApp = async () => {
  const authenticated = await checkAuth();
  
  if (!authenticated) {
    // Redirect to auth page
    window.location.href = '/auth.html';
    return;
  }
  
  // User is authenticated, mount the app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initialize app
initApp();
