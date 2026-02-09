/**
 * MapCap IPO - Official Entry Point v1.1
 * Architected by Eslam Kora | AppDev @Map-of-Pi
 * ---------------------------------------------------------
 * Purpose: 
 * 1. Bootstraps the React application into the DOM.
 * 2. Injects Global Styles (index.css) for the Single-Screen layout.
 * 3. Initializes the IpoProvider (Context API) to manage global Web3 state.
 * * Visionary: Philip Jennings & Daniel (Map-of-Pi)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles following the 'Plain White Background' requirement [Source: Page 3]
import './index.css';

// Core Application Engine
import App from './App.jsx';

// Global State Provider for Pi SDK & MERN Backend Synchronization
import { IpoProvider } from './context/IpoContext';

/**
 * Root Renderer
 * We wrap the <App /> with <IpoProvider> to enable the 'useIpo' custom hook 
 * throughout the entire component tree, ensuring real-time data integrity.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IpoProvider>
      <App />
    </IpoProvider>
  </StrictMode>,
);
