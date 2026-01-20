import { useState } from 'react';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Counter() {
  const [count, setCount] = useState(0);
  const [isRipple, setIsRipple] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Progress Ring Logic (e.g., target 100 for a generic "Tasbih" cycle)
  const cycleTarget = 33; 
  const progress = (count % cycleTarget) / cycleTarget * 100;
  
  // Live query
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysLogs = useLiveQuery(() => 
    db.logs.where('dateStr').equals(todayStr).toArray()
  );
  const todayTotal = todaysLogs?.reduce((acc, log) => acc + log.count, 0) || 0;

  const handleTap = async () => {
    if (navigator.vibrate) navigator.vibrate(15); // Lighter, sharper vibration
    
    setIsRipple(true);
    setTimeout(() => setIsRipple(false), 400);

    setCount(c => c + 1);

    db.logs.add({
      count: 1,
      timestamp: new Date(),
      dateStr: todayStr
    }).catch(console.error);
  };

  const handleResetSession = () => {
    if (confirm('Start a new session?')) setCount(0);
  };

  return (
    <div className="flex flex-col items-center h-screen pt-12 relative">
      
      {/* Top Bar */}
      <div className="w-full px-8 flex justify-between items-start animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h2 className="font-serif text-slate-400 text-sm tracking-[0.2em] uppercase">Today</h2>
          <p className="font-serif text-3xl text-white drop-shadow-md">{todayTotal.toLocaleString()}</p>
        </div>
        
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-full bg-slate-800/30 text-slate-400 hover:text-gold-400 hover:bg-slate-800/50 transition-all border border-white/5 backdrop-blur-sm"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Main Counter Area */}
      <div className="flex-1 flex flex-col justify-center items-center -mt-16 w-full">
        <div className="relative">
          
          {/* Progress Ring SVG */}
          <div className="absolute inset-0 -m-4">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
               <circle 
                 cx="50" cy="50" r="48" 
                 fill="none" 
                 stroke="currentColor" 
                 className="text-slate-800" 
                 strokeWidth="2"
               />
               <circle 
                 cx="50" cy="50" r="48" 
                 fill="none" 
                 stroke="currentColor" 
                 className="text-gold-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                 strokeWidth="2"
                 strokeDasharray="301.59"
                 strokeDashoffset={301.59 - (301.59 * progress) / 100}
                 strokeLinecap="round"
               />
             </svg>
          </div>

          {/* The Button */}
          <button
            onClick={handleTap}
            className="group relative w-72 h-72 rounded-full bg-gradient-to-br from-midnight-800 to-midnight-950 shadow-[20px_20px_60px_#050812,-20px_-20px_60px_#1e293b] flex flex-col items-center justify-center outline-none active:scale-[0.98] transition-all duration-200 border border-white/5"
          >
            {/* Inner Ring Glow */}
            <div className="absolute inset-2 rounded-full border border-white/5 shadow-inner-light" />
            
            {/* Gold Accent Ring */}
            <div className="absolute inset-6 rounded-full border border-gold-500/10 group-active:border-gold-500/20 transition-colors" />

            {/* Ripple */}
            <AnimatePresence>
              {isRipple && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-gold-400/10 rounded-full blur-md"
                />
              )}
            </AnimatePresence>

            <span className="font-serif text-8xl text-gold-400 drop-shadow-2xl select-none tabular-nums tracking-tighter">
              {count}
            </span>
            <span className="text-slate-500 text-xs tracking-[0.3em] font-medium uppercase mt-2 group-hover:text-gold-500/50 transition-colors">
              Tasbih
            </span>
          </button>
        </div>

        {/* Cycle Indicator */}
        <div className="mt-12 text-center space-y-2 opacity-60">
           <div className="flex items-center gap-2 justify-center text-xs tracking-widest uppercase text-slate-400">
             <span>Cycle</span>
             <span className="w-12 h-[1px] bg-slate-700"></span>
             <span className="text-gold-500">{count % cycleTarget} / {cycleTarget}</span>
           </div>
        </div>

        {/* Reset */}
        <div className="absolute bottom-32">
          <button 
             onClick={handleResetSession}
             className="flex items-center gap-2 px-6 py-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all text-xs tracking-widest uppercase"
          >
             <RotateCcw size={14} /> Reset
          </button>
        </div>

      </div>
    </div>
  );
}
