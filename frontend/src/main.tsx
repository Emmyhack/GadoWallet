// Import polyfills first before any other modules
import './polyfills'

console.log('🚀 Main.tsx loaded');

import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('📦 React imports loaded');

import App from './App.tsx'
import MinimalApp from './MinimalApp.tsx'
import './index.css'
import './lib/i18n'
import { ThemeProvider } from './lib/theme'

console.log('🎨 App and styles loaded');

try {
  const rootElement = document.getElementById('root');
  console.log('🎯 Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  console.log('⚛️ React root created');

  // Check if we should load the full app or minimal app
  const useMinimal = !window.location.search.includes('full=true');
  
  if (useMinimal) {
    console.log('🔥 Loading minimal app for debugging');
    root.render(<MinimalApp />);
  } else {
    console.log('🚀 Loading full app');
    root.render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );
  }
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  
  // Fallback rendering
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui;">
        <h1>Gado Wallet</h1>
        <p>Loading error occurred. Check console for details.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">Reload</button>
      </div>
    `;
  }
}
