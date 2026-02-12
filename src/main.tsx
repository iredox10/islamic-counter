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

let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

updateSW = registerSW({
  onNeedRefresh() {
    showUpdateBanner();
  },
  onOfflineReady() {
    showOfflineReadyBanner();
  },
});

function showUpdateBanner() {
  const existingBanner = document.getElementById('update-banner');
  if (existingBanner) return;

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #d4af37, #d97706);
      color: #020617;
      padding: 12px 24px;
      border-radius: 16px;
      font-family: sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 40px rgba(212, 175, 55, 0.4);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.3s ease-out;
    ">
      <span>✨ New update available!</span>
      <button id="update-btn" style="
        background: #020617;
        color: #d4af37;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
      ">Update Now</button>
      <button id="dismiss-btn" style="
        background: transparent;
        border: none;
        color: #020617;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
      ">×</button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(banner);

  document.getElementById('update-btn')?.addEventListener('click', () => {
    if (updateSW) updateSW(true);
  });

  document.getElementById('dismiss-btn')?.addEventListener('click', () => {
    banner.remove();
  });
}

function showOfflineReadyBanner() {
  const banner = document.createElement('div');
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 24px;
      border-radius: 16px;
      font-family: sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    ">
      ✅ App ready for offline use!
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(banner);
  
  setTimeout(() => {
    banner.remove();
  }, 3000);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
