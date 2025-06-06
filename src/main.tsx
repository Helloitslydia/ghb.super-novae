import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#374151',
          border: '1px solid #E5E7EB',
        },
        className: 'my-toast',
      }}
    />
    <App />
  </StrictMode>
);
