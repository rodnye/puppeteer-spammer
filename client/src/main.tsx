import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from './providers/QueryClientProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
