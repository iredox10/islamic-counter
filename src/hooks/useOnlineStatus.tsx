import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 bg-amber-500/90 text-amber-950 text-xs font-bold"
        >
          <WifiOff size={14} />
          <span>You're offline - data will sync when connected</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OnlineStatusBadge() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex items-center gap-1 text-[10px] ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
      {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}
