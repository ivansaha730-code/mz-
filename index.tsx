import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("MZ+ System: Starting initialization...");

const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("MZ+ System: Root element not found");
      return;
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("MZ+ System: React rendered successfully.");
  } catch (error) {
    console.error("MZ+ System: Mounting error:", error);
    throw error;
  }
};

// On s'assure que le DOM est prêt avant de monter
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}