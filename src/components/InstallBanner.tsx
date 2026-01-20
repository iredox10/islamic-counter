import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function InstallBanner() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-40 max-w-md mx-auto"
      >
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between shadow-2xl border-gold-500/20 bg-midnight-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gold-500/10 p-2 rounded-lg text-gold-400">
              <Download size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-sm">Install App</p>
              <p className="text-slate-400 text-xs">Add to home screen for better experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-500 hover:text-slate-300"
            >
              <X size={16} />
            </button>
            <button
              onClick={promptInstall}
              className="bg-gold-500 text-midnight-950 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gold-400 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
