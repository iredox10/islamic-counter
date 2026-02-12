import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
import { registerSW } from 'virtual:pwa-register';

// Request persistent storage to prevent browser from clearing IndexedDB
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((persisted) => {
    if (persisted) {
      console.log('Persistent storage granted - data protected from automatic cleanup');
    } else {
      console.warn('Persistent storage denied - data may be cleared under storage pressure');
    }
  });
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
