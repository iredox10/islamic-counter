import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCcw, Volume2, VolumeX, Flame, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { calculateStreak, cn } from '../lib/utils';
import { gregorianToHijri, getSpecialDay, getUpcomingSpecialDays } from '../lib/hijri';
import { useAchievementTracker } from '../lib/useAchievementTracker';

const MULTI_COUNTER_PRESET = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 33 },
];

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

  // Multi-counter mode
  const [multiMode, setMultiMode] = useState(false);
  const [multiCounts, setMultiCounts] = useState(() => {
    const saved = localStorage.getItem('multi-counter-state');
    return saved ? JSON.parse(saved) : [0, 0, 0];
  });
  const [activeCounterIndex, setActiveCounterIndex] = useState(0);

  // Long-press manual entry
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCount, setManualCount] = useState('');
  const holdTimeoutRef = useRef<any>(null);

  // Auto-reset at midnight
  const autoReset = localStorage.getItem('auto-reset') === 'true';

  // Check for midnight reset
  useEffect(() => {
    const lastDate = localStorage.getItem('last-counter-date');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastDate && lastDate !== today && autoReset) {
      setSessionCount(0);
      setActiveTargetId(null);
      localStorage.setItem('counter-state', JSON.stringify({ count: 0, targetId: null }));
    }
    
    localStorage.setItem('last-counter-date', today);
  }, [autoReset]);

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
  const progressPercent = multiMode
    ? Math.min(100, (multiCounts[activeCounterIndex] / MULTI_COUNTER_PRESET[activeCounterIndex].target) * 100)
    : activeTarget 
      ? Math.min(100, (activeTarget.currentCount / activeTarget.targetCount) * 100)
      : (sessionCount % 33) / 33 * 100;

  // Live query for stats
  const todaysLogs = useLiveQuery(() => 
    db.logs.where('dateStr').equals(todayStr).toArray()
  );
  const todayTotal = todaysLogs?.reduce((acc, log) => acc + log.count, 0) || 0;

  // Streak calculation
  const allLogs = useLiveQuery(() => db.logs.toArray());
  const uniqueDates = allLogs ? [...new Set(allLogs.map(log => log.dateStr))] : [];
  const { currentStreak } = calculateStreak(uniqueDates);

  // Total counts
  const totalCount = allLogs?.reduce((acc, log) => acc + log.count, 0) || 0;

  // Completed goals
  const completedGoals = useLiveQuery(() => 
    db.targets.where('status').equals('completed').count()
  );

  // Achievement tracking
  useAchievementTracker(totalCount, currentStreak, completedGoals || 0, sessionCount);

  // Hijri date
  const hijriDate = gregorianToHijri(new Date());
  const specialDay = getSpecialDay(hijriDate);
  const upcomingDays = getUpcomingSpecialDays(hijriDate, 2);

  const handleTap = async () => {
    const currentCount = multiMode ? multiCounts[activeCounterIndex] + 1 : sessionCount + 1;
    
    // Milestone vibration patterns
    if (navigator.vibrate) {
      if (currentCount === 33) {
        navigator.vibrate([30, 50, 30, 50, 30]); // Triple pulse for 33
      } else if (currentCount === 100) {
        navigator.vibrate([50, 100, 50, 100, 50, 100, 50]); // Quadruple pulse for 100
      } else if (currentCount === 1000) {
        navigator.vibrate([100, 100, 100, 100, 100, 100, 100]); // Celebration pattern for 1000
      } else {
        navigator.vibrate(15); // Normal tap
      }
    }
    
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

    // Multi-counter mode
    if (multiMode) {
      const newCounts = [...multiCounts];
      newCounts[activeCounterIndex]++;
      setMultiCounts(newCounts);
      localStorage.setItem('multi-counter-state', JSON.stringify(newCounts));
      
      // Auto-advance when target reached
      if (newCounts[activeCounterIndex] >= MULTI_COUNTER_PRESET[activeCounterIndex].target && activeCounterIndex < 2) {
        setActiveCounterIndex(activeCounterIndex + 1);
      }
    } else {
      setSessionCount((c: number) => c + 1);
    }

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

  // Long-press handlers for manual entry
  const handleHoldStart = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setShowManualEntry(true);
    }, 800);
  };

  const handleHoldEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  };

  const handleManualSubmit = async () => {
    const count = parseInt(manualCount);
    if (isNaN(count) || count <= 0) return;

    if (multiMode) {
      const newCounts = [...multiCounts];
      newCounts[activeCounterIndex] += count;
      setMultiCounts(newCounts);
      localStorage.setItem('multi-counter-state', JSON.stringify(newCounts));
    } else {
      setSessionCount((c: number) => c + count);
    }

    await db.logs.add({
      count,
      timestamp: new Date(),
      dateStr: todayStr,
      targetId: activeTargetId || undefined
    });

    if (activeTargetId && activeTarget) {
      await db.targets.update(activeTargetId, {
        currentCount: (activeTarget.currentCount || 0) + count
      });
    }

    setManualCount('');
    setShowManualEntry(false);
  };

  return (
    <div className="flex flex-col items-center min-h-full pt-12 relative">
      
      {/* Top Bar */}
      <div className="w-full px-8 flex justify-between items-start animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h2 className="font-serif text-slate-400 text-sm tracking-[0.2em] uppercase">Today</h2>
          <p className="font-serif text-3xl text-white drop-shadow-md">{todayTotal.toLocaleString()}</p>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">{currentStreak} day streak</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-full bg-slate-800/30 text-slate-400 hover:text-gold-400 hover:bg-slate-800/50 transition-all border border-white/5 backdrop-blur-sm"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Multi-counter Mode Toggle */}
      <div className="w-full px-8 mt-3">
        <button
          onClick={() => {
            setMultiMode(!multiMode);
            if (!multiMode) {
              setMultiCounts([0, 0, 0]);
              setActiveCounterIndex(0);
            }
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all",
            multiMode 
              ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" 
              : "bg-slate-800/30 text-slate-500 border border-white/5"
          )}
        >
          <Layers size={14} />
          <span>Post-Salah Mode</span>
        </button>
      </div>

      {/* Hijri Date */}
      <div className="w-full px-8 mt-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">{hijriDate.formatted}</span>
          {specialDay && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              {specialDay.name}
            </span>
          )}
        </div>
        {upcomingDays.length > 0 && !specialDay && (
          <div className="text-[10px] text-slate-500 mt-1">
            Next: {upcomingDays[0].name} in {upcomingDays[0].daysUntil} days
          </div>
        )}
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
                 strokeDashoffset={301.59 - (301.59 * progressPercent) / 100}
                 strokeLinecap="round"
               />
             </svg>
          </div>

{/* The Button */}
           <button
             onClick={handleTap}
             onContextMenu={(e) => {
               e.preventDefault();
               setShowManualEntry(true);
             }}
             onTouchStart={handleHoldStart}
             onTouchEnd={handleHoldEnd}
             onMouseDown={handleHoldStart}
             onMouseUp={handleHoldEnd}
             onMouseLeave={handleHoldEnd}
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
                {multiMode ? (
                  <>
                    <span className="text-lg text-gold-400/70 font-arabic" dir="rtl">
                      {MULTI_COUNTER_PRESET[activeCounterIndex].arabic}
                    </span>
                    <span className="font-serif text-7xl text-gold-400 drop-shadow-2xl select-none tabular-nums tracking-tighter">
                      {multiCounts[activeCounterIndex]}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      / {MULTI_COUNTER_PRESET[activeCounterIndex].target}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-serif text-8xl text-gold-400 drop-shadow-2xl select-none tabular-nums tracking-tighter">
                      {sessionCount}
                    </span>
                  </>
                )}
             </div>

             <span className="text-slate-500 text-xs tracking-[0.3em] font-medium uppercase mt-2 group-hover:text-gold-500/50 transition-colors truncate max-w-48">
               {multiMode 
                 ? MULTI_COUNTER_PRESET[activeCounterIndex].name 
                 : activeTarget?.title || 'Tasbih'}
             </span>
          </button>
        </div>

{/* Indicator */}
         <div className="mt-12 text-center space-y-2 opacity-60 h-10">
            {multiMode ? (
              <div className="flex items-center gap-3 justify-center">
                {MULTI_COUNTER_PRESET.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCounterIndex(idx)}
                    className={cn(
                      "flex flex-col items-center px-3 py-2 rounded-lg transition-all",
                      activeCounterIndex === idx 
                        ? "bg-gold-500/20 border border-gold-500/30" 
                        : "bg-slate-800/30 border border-white/5"
                    )}
                  >
                    <span className="text-[10px] text-gold-400/80">{item.arabic}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      multiCounts[idx] >= item.target ? "text-emerald-400" : "text-slate-300"
                    )}>
                      {multiCounts[idx]}/{item.target}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
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
)}
          </div>

        {/* Manual Entry Modal */}
        <AnimatePresence>
          {showManualEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowManualEntry(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-midnight-900 border border-gold-500/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              >
                <h3 className="font-serif text-xl text-slate-100 mb-4">Add Count Manually</h3>
                <input
                  type="number"
                  value={manualCount}
                  onChange={(e) => setManualCount(e.target.value)}
                  placeholder="Enter count (e.g. 100)"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-white text-2xl text-center placeholder-slate-500 focus:border-gold-500/50 outline-none"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowManualEntry(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualSubmit}
                    className="flex-1 py-3 rounded-xl bg-gold-500 text-midnight-950 font-bold hover:bg-gold-400 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-3">
                  Long-press the counter button to open this dialog
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
