import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';
import { startNotificationChecker } from './lib/reminders';
import { initAnalytics } from './lib/analytics';
import { playNotificationSound } from './lib/sounds';

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((persisted) => {
    if (persisted) {
      console.log('Persistent storage granted - data protected from automatic cleanup');
    } else {
      console.warn('Persistent storage denied - data may be cleared under storage pressure');
    }
  });
}

registerSW({
  onNeedRefresh() {
    console.log('New version available, reloading...');
    window.location.reload();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
});

navigator.serviceWorker?.addEventListener('message', (event) => {
  if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
    playNotificationSound();
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }
});

startNotificationChecker();
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
