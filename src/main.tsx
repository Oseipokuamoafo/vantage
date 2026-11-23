import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ensureDemoAdmin } from './data/auth';
import './index.css';

void ensureDemoAdmin().catch(() => {
  // Web Crypto is unavailable on insecure origins. The admin account is then simply absent.
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
