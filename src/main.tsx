
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Make sure we're using the correct element ID that exists in the HTML
const rootElement = document.getElementById('root');

// Add error handling to catch potential issues with finding the root element
if (!rootElement) {
  console.error('Root element not found. Make sure there is a div with id="root" in your HTML file.');
} else {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
