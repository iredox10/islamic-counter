import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { RotateCcw, Volume2, VolumeX, Flame, Calendar, Layers, Check, Circle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { calculateStreak, cn } from '../lib/utils';
import { gregorianToHijri, getSpecialDay, getUpcomingSpecialDays } from '../lib/hijri';
import { useAchievementTracker } from '../lib/useAchievementTracker';
import { PRAYERS, getPrayerAdhkar, type PrayerName, type AdhkarItem } from '../lib/adhkar';

const MULTI_COUNTER_PRESET = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 33 },
];

function DailyPrayerTracker({ 
  todayStr, 
  onSelectPrayer, 
  activePrayer 
}: { 
  todayStr: string; 
  onSelectPrayer: (prayer: PrayerName) => void; 
  activePrayer: PrayerName | null;
}) {
  const todayCompletions = useLiveQuery(
    () => db.prayerCompletions.where('dateStr').equals(todayStr).toArray(),
    [todayStr]
  );

  const completedPrayers = new Set(todayCompletions?.map(c => c.prayer) || []);

  return (
    <div className="flex items-center justify-center gap-1.5">
      {PRAYERS.map((prayer) => {
        const isCompleted = completedPrayers.has(prayer.id);
        const isActive = activePrayer === prayer.id;
        
        return (
          <button
            key={prayer.id}
            onClick={() => onSelectPrayer(prayer.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all",
              isActive && "bg-gold-500/20 border border-gold-500/30",
              !isActive && isCompleted && "bg-emerald-500/10 border border-emerald-500/20",
              !isActive && !isCompleted && "bg-slate-800/30 border border-white/5 hover:bg-slate-800/50"
            )}
          >
            <span className="text-[10px] font-arabic text-slate-300">{prayer.arabicName}</span>
            {isCompleted ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Circle size={12} className={isActive ? "text-gold-400" : "text-slate-500"} />
            )}
          </button>
        );
      })}
    </div>
  );
}

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

  // Show/hide adhkar list
  const [showAdhkarList, setShowAdhkarList] = useState(() => {
    return localStorage.getItem('show-adhkar-list') !== 'false';
  });

  // Multi-counter mode
  const [multiMode, setMultiMode] = useState(false);
  const [multiCounts, setMultiCounts] = useState(() => {
    const saved = localStorage.getItem('multi-counter-state');
    return saved ? JSON.parse(saved) : [0, 0, 0];
  });
  const [activeCounterIndex, setActiveCounterIndex] = useState(0);

  // Prayer-specific mode
  const [prayerMode, setPrayerMode] = useState<PrayerName | null>(() => {
    const saved = localStorage.getItem('prayer-mode');
    return saved ? JSON.parse(saved) : null;
  });
  const [showPrayerSelector, setShowPrayerSelector] = useState(false);
  const [prayerAdhkar, setPrayerAdhkar] = useState<AdhkarItem[]>([]);
  const [prayerCounts, setPrayerCounts] = useState<number[]>([]);
  const [activeAdhkarIndex, setActiveAdhkarIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Long-press manual entry
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCount, setManualCount] = useState('');
  const holdTimeoutRef = useRef<any>(null);

  // Auto-reset at midnight
  const autoReset = localStorage.getItem('auto-reset') === 'true';

  // Initialize prayer adhkar when prayer mode changes
  useEffect(() => {
    if (prayerMode) {
      const adhkar = getPrayerAdhkar(prayerMode);
      setPrayerAdhkar(adhkar);
      const savedCounts = localStorage.getItem(`prayer-counts-${prayerMode}`);
      setPrayerCounts(savedCounts ? JSON.parse(savedCounts) : adhkar.map(() => 0));
      const savedIndex = localStorage.getItem(`prayer-index-${prayerMode}`);
      setActiveAdhkarIndex(savedIndex ? parseInt(savedIndex) : 0);
      localStorage.setItem('prayer-mode', JSON.stringify(prayerMode));
    } else {
      setPrayerAdhkar([]);
      setPrayerCounts([]);
      setActiveAdhkarIndex(0);
      localStorage.removeItem('prayer-mode');
    }
  }, [prayerMode]);

  // Persist prayer counts
  useEffect(() => {
    if (prayerMode && prayerCounts.length > 0) {
      localStorage.setItem(`prayer-counts-${prayerMode}`, JSON.stringify(prayerCounts));
      localStorage.setItem(`prayer-index-${prayerMode}`, String(activeAdhkarIndex));
    }
  }, [prayerCounts, activeAdhkarIndex, prayerMode]);

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

  useEffect(() => {
    localStorage.setItem('show-adhkar-list', String(showAdhkarList));
  }, [showAdhkarList]);

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
  const progressPercent = prayerMode && prayerAdhkar.length > 0
    ? Math.min(100, (prayerCounts[activeAdhkarIndex] || 0) / prayerAdhkar[activeAdhkarIndex].target * 100)
    : multiMode
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
    let currentCount = sessionCount + 1;
    
    if (prayerMode && prayerAdhkar.length > 0) {
      currentCount = (prayerCounts[activeAdhkarIndex] || 0) + 1;
    } else if (multiMode) {
      currentCount = multiCounts[activeCounterIndex] + 1;
    }
    
    // Milestone vibration patterns
    if (navigator.vibrate) {
      if (currentCount === 33) {
        navigator.vibrate([30, 50, 30, 50, 30]);
      } else if (currentCount === 100) {
        navigator.vibrate([50, 100, 50, 100, 50, 100, 50]);
      } else if (currentCount === 1000) {
        navigator.vibrate([100, 100, 100, 100, 100, 100, 100]);
      } else {
        navigator.vibrate(15);
      }
    }
    
    if (soundEnabled) playClick();
    
    setIsRipple(true);
    setTimeout(() => setIsRipple(false), 400);

    if (!isActive) setIsActive(true);
    
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 60000);

    // Prayer mode
    if (prayerMode && prayerAdhkar.length > 0) {
      const newCounts = [...prayerCounts];
      newCounts[activeAdhkarIndex]++;
      setPrayerCounts(newCounts);
      
      // Check if all adhkar are completed
      const allCompleted = newCounts.every((count, idx) => count >= prayerAdhkar[idx].target);
      const wasNotCompleted = prayerCounts.some((count, idx) => count < prayerAdhkar[idx].target);
      
      if (allCompleted && wasNotCompleted) {
        // Save prayer completion to database
        const existingCompletion = await db.prayerCompletions
          .where({ prayer: prayerMode, dateStr: todayStr })
          .first();
        
        if (!existingCompletion) {
          await db.prayerCompletions.add({
            prayer: prayerMode,
            dateStr: todayStr,
            completedAt: new Date(),
            totalAdhkar: prayerAdhkar.length,
            completedAdhkar: prayerAdhkar.length
          });
        }
        
        // Show completion modal
        setShowCompletionModal(true);
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
        }
      }
      
      // Auto-advance when target reached
      if (newCounts[activeAdhkarIndex] >= prayerAdhkar[activeAdhkarIndex].target && activeAdhkarIndex < prayerAdhkar.length - 1) {
        setActiveAdhkarIndex(activeAdhkarIndex + 1);
      }
    }
    // Multi-counter mode
    else if (multiMode) {
      const newCounts = [...multiCounts];
      newCounts[activeCounterIndex]++;
      setMultiCounts(newCounts);
      localStorage.setItem('multi-counter-state', JSON.stringify(newCounts));
      
      if (newCounts[activeCounterIndex] >= MULTI_COUNTER_PRESET[activeCounterIndex].target && activeCounterIndex < 2) {
        setActiveCounterIndex(activeCounterIndex + 1);
      }
    } else {
      setSessionCount((c: number) => c + 1);
    }

    await db.logs.add({
      count: 1,
      timestamp: new Date(),
      dateStr: todayStr,
      targetId: activeTargetId || undefined
    });

    if (activeTargetId && activeTarget) {
      await db.targets.update(activeTargetId, {
        currentCount: (activeTarget.currentCount || 0) + 1
      });
    }
  };

  const handleResetSession = async () => {
    if (prayerMode && prayerAdhkar.length > 0) {
      if (confirm('Reset all adhkar for this prayer?')) {
        const newCounts = prayerAdhkar.map(() => 0);
        setPrayerCounts(newCounts);
        setActiveAdhkarIndex(0);
        localStorage.setItem(`prayer-counts-${prayerMode}`, JSON.stringify(newCounts));
        localStorage.setItem(`prayer-index-${prayerMode}`, '0');
      }
      return;
    }
    
    if (confirm('Reset this session?')) {
      setSessionCount(0);
      
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

      {/* Hijri Date + Post-Salah Mode - Same Row */}
      <div className="w-full px-8 mt-3 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowPrayerSelector(!showPrayerSelector)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all",
              prayerMode 
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" 
                : "bg-slate-800/30 text-slate-500 border border-white/5"
            )}
          >
            <Layers size={14} />
            <span>{prayerMode ? `After ${PRAYERS.find(p => p.id === prayerMode)?.name}` : 'Post-Salah'}</span>
          </button>
          
          {/* Prayer Selector Dropdown */}
          <AnimatePresence>
            {showPrayerSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 bg-midnight-900 border border-gold-500/20 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]"
              >
                {PRAYERS.map((prayer) => (
                  <button
                    key={prayer.id}
                    onClick={() => {
                      setPrayerMode(prayerMode === prayer.id ? null : prayer.id);
                      setMultiMode(false);
                      setShowPrayerSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left transition-all",
                      prayerMode === prayer.id 
                        ? "bg-gold-500/20 text-gold-400" 
                        : "text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    <span className="font-arabic text-sm">{prayer.arabicName}</span>
                    <span className="text-xs">{prayer.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">{hijriDate.formatted}</span>
            {specialDay && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                {specialDay.name}
              </span>
            )}
          </div>
          {upcomingDays.length > 0 && !specialDay && (
            <div className="text-[10px] text-slate-500 mt-0.5">
              Next: <span className="text-emerald-400">{upcomingDays[0].name}</span> in {upcomingDays[0].daysUntil} days
            </div>
          )}
        </div>
      </div>

      {/* Main Counter Area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
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

{/* Display Logic */}
              <div className="flex flex-col items-center">
                {prayerMode && prayerAdhkar.length > 0 ? (
                  <>
                    <span className="text-sm text-gold-400/70 font-arabic text-center px-4" dir="rtl">
                      {prayerAdhkar[activeAdhkarIndex]?.arabic?.substring(0, 50)}
                      {prayerAdhkar[activeAdhkarIndex]?.arabic && prayerAdhkar[activeAdhkarIndex].arabic.length > 50 && '...'}
                    </span>
                    <span className="font-serif text-7xl text-gold-400 drop-shadow-2xl select-none tabular-nums tracking-tighter">
                      {prayerCounts[activeAdhkarIndex] || 0}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      / {prayerAdhkar[activeAdhkarIndex]?.target}
                    </span>
                  </>
                ) : multiMode ? (
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
                {prayerMode && prayerAdhkar.length > 0 
                  ? prayerAdhkar[activeAdhkarIndex]?.title
                  : multiMode 
                    ? MULTI_COUNTER_PRESET[activeCounterIndex].name 
                    : activeTarget?.title || 'Tasbih'}
              </span>
           </button>
         </div>

        {/* Prayer Progress Pills - compact inline display */}
        {prayerMode && prayerAdhkar.length > 0 && (
          <div className="flex flex-col items-center mt-4 gap-2">
            <button
              onClick={() => setShowAdhkarList(!showAdhkarList)}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showAdhkarList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              <span>{showAdhkarList ? 'Hide' : 'Show'} adhkar list</span>
            </button>
            {showAdhkarList && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[85vw]">
                {prayerAdhkar.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveAdhkarIndex(idx)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all",
                      activeAdhkarIndex === idx 
                        ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" 
                        : (prayerCounts[idx] || 0) >= item.target
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800/30 text-slate-400 border border-white/5"
                    )}
                  >
                    {(prayerCounts[idx] || 0) >= item.target && <Check size={10} />}
                    <span>{item.title.substring(0, 12)}{item.title.length > 12 ? '...' : ''}</span>
                    <span className="opacity-60">{prayerCounts[idx] || 0}/{item.target}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-mode Pills */}
        {multiMode && (
          <div className="flex items-center gap-2 mt-4 justify-center">
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
        )}

        {/* Cycle indicator for normal mode */}
        {!prayerMode && !multiMode && (
          <div className="flex items-center gap-2 justify-center text-xs tracking-widest uppercase text-slate-400 mt-4">
            {activeTarget ? (
              <>
                <span>Goal</span>
                <span className="w-8 h-[1px] bg-slate-700"></span>
                <span className="text-gold-500">{activeTarget.currentCount}/{activeTarget.targetCount}</span>
              </>
            ) : (
              <>
                <span>Cycle</span>
                <span className="w-8 h-[1px] bg-slate-700"></span>
                <span className="text-gold-500">{sessionCount % 33}/33</span>
              </>
            )}
          </div>
        )}

        {/* Reset Button */}
        <button 
           onClick={handleResetSession}
           className="flex items-center gap-2 px-6 py-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all text-xs tracking-widest uppercase mt-4"
        >
           <RotateCcw size={14} /> Reset
        </button>

        {/* Daily Prayer Tracker - Bottom */}
        <div className="mt-4">
          <DailyPrayerTracker 
            todayStr={todayStr}
            onSelectPrayer={(prayer) => {
              setPrayerMode(prayerMode === prayer ? null : prayer);
              setMultiMode(false);
            }}
            activePrayer={prayerMode}
          />
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

        {/* Prayer Completion Modal */}
        <AnimatePresence>
          {showCompletionModal && prayerMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-midnight-900 border border-emerald-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <h3 className="font-serif text-2xl text-slate-100 mb-2">MashAllah! 🎉</h3>
                <p className="text-slate-400 mb-4">
                  You have completed all adhkar for <span className="text-gold-400 font-medium">{PRAYERS.find(p => p.id === prayerMode)?.name}</span> prayer
                </p>
                <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-slate-300">
                    <span className="text-emerald-400 font-bold">{prayerAdhkar.length}</span> adhkar completed
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCompletionModal(false);
                      setPrayerMode(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="flex-1 py-3 rounded-xl bg-gold-500 text-midnight-950 font-bold hover:bg-gold-400 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
