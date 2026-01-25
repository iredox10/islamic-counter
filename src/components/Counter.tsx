import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCcw, Volume2, VolumeX, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

export function Counter() {
  const [isRipple, setIsRipple] = useState(false);
  const { playClick } = useSound();
  
  // Timer State
  const [isActive, setIsActive] = useState(false);
  const idleTimeoutRef = useRef<any>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Persistence State must be declared BEFORE useEffects that use it
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem('counter-state');
    return saved ? JSON.parse(saved).count || 0 : 0;
  });

  const [activeTargetId, setActiveTargetId] = useState<number | null>(() => {
    const saved = localStorage.getItem('counter-state');
    return saved ? JSON.parse(saved).targetId || null : null;
  });

  // Persist Sound Setting
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sound-enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sound-enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    
    if (isActive) {
      interval = setInterval(async () => {
        const activeId = activeTargetId || 0; // 0 for general
        
        try {
          const existing = await db.durations.where({ dateStr: todayStr, targetId: activeId }).first();
          if (existing) {
            await db.durations.update(existing.id!, { seconds: existing.seconds + 1 });
          } else {
            await db.durations.add({ dateStr: todayStr, targetId: activeId, seconds: 1 });
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, activeTargetId, todayStr]);

  // Query Active Target if ID exists
  const activeTarget = useLiveQuery(
    async () => {
      if (!activeTargetId) return undefined;
      return await db.targets.get(activeTargetId);
    },
    [activeTargetId]
  );
  
  // Persist state on changes
  useEffect(() => {
    localStorage.setItem('counter-state', JSON.stringify({
      count: sessionCount,
      targetId: activeTargetId
    }));
  }, [sessionCount, activeTargetId]);

  // Ring Progress Logic
  // If Target is active, use Target's counts. If not, use generic 33 cycle.
  const progressPercent = activeTarget 
    ? Math.min(100, (activeTarget.currentCount / activeTarget.targetCount) * 100)
    : (sessionCount % 33) / 33 * 100;

  // Live query for stats
  const todaysLogs = useLiveQuery(() => 
    db.logs.where('dateStr').equals(todayStr).toArray()
  );
  const todayTotal = todaysLogs?.reduce((acc, log) => acc + log.count, 0) || 0;

  const handleTap = async () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (soundEnabled) playClick();
    
    setIsRipple(true);
    setTimeout(() => setIsRipple(false), 400);

    // Timer Logic
    if (!isActive) setIsActive(true);
    
    // Reset Idle Timer (60s)
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 60000);

    // Update Session Visual
    setSessionCount((c: number) => c + 1);

    // DB Updates
    await db.logs.add({
      count: 1,
      timestamp: new Date(),
      dateStr: todayStr,
      targetId: activeTargetId || undefined
    });

    // Update Target if active
    if (activeTargetId && activeTarget) {
      await db.targets.update(activeTargetId, {
        currentCount: (activeTarget.currentCount || 0) + 1
      });
    }
  };

  const handleResetSession = async () => {
    if (confirm('Reset this session?')) {
      setSessionCount(0);
      
      // If there is an active target, we must also reset its progress in the DB
      // so the ring (which depends on target.currentCount) resets too.
      if (activeTargetId) {
        await db.targets.update(activeTargetId, {
          currentCount: 0
        });
      }
    }
  };

  const clearActiveTarget = () => {
    if (confirm('Stop tracking this goal?')) {
      setActiveTargetId(null);
      setSessionCount(0); // Reset visual counter to 0 for a fresh session
    }
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

      {/* Target Indicator Pill (If Active) */}
      <AnimatePresence>
        {activeTarget && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-md z-10"
          >
             <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold">Target Active</span>
                <span className="text-sm font-serif text-slate-100">{activeTarget.title}</span>
             </div>
             <button onClick={clearActiveTarget} className="text-slate-400 hover:text-white ml-2">
                <XCircle size={18} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                 strokeDashoffset={301.59 - (301.59 * progressPercent) / 100}
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

            {/* Display Logic: If target, show progress/total. If not, show session count. */}
            <div className="flex flex-col items-center">
               <span className="font-serif text-8xl text-gold-400 drop-shadow-2xl select-none tabular-nums tracking-tighter">
                  {sessionCount}
               </span>
            </div>

            <span className="text-slate-500 text-xs tracking-[0.3em] font-medium uppercase mt-2 group-hover:text-gold-500/50 transition-colors">
              Tasbih
            </span>
          </button>
        </div>

        {/* Indicator */}
        <div className="mt-12 text-center space-y-2 opacity-60 h-10">
           <div className="flex items-center gap-2 justify-center text-xs tracking-widest uppercase text-slate-400">
             {activeTarget ? (
                <>
                   <span>Goal Progress</span>
                   <span className="w-12 h-[1px] bg-slate-700"></span>
                   <span className="text-gold-500">{activeTarget.currentCount} / {activeTarget.targetCount}</span>
                </>
             ) : (
                <>
                   <span>Cycle</span>
                   <span className="w-12 h-[1px] bg-slate-700"></span>
                   <span className="text-gold-500">{sessionCount % 33} / 33</span>
                </>
             )}
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
