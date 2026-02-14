import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ADHKAR_COLLECTIONS, type AdhkarCollection } from '../lib/adhkar';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Hand, Bed, Sparkles, ChevronRight, Check, X, Languages } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'morning': Sun,
  'evening': Moon,
  'post-prayer': Hand,
  'sleep': Bed,
  'general': Sparkles,
  'fajr': Sun,
  'dhuhr': Sun,
  'asr': Sun,
  'maghrib': Moon,
  'isha': Moon
};

const categoryColors: Record<string, string> = {
  'morning': 'text-amber-400 bg-amber-500/10',
  'evening': 'text-indigo-400 bg-indigo-500/10',
  'post-prayer': 'text-emerald-400 bg-emerald-500/10',
  'sleep': 'text-purple-400 bg-purple-500/10',
  'general': 'text-gold-400 bg-gold-500/10',
  'fajr': 'text-amber-400 bg-amber-500/10',
  'dhuhr': 'text-yellow-400 bg-yellow-500/10',
  'asr': 'text-orange-400 bg-orange-500/10',
  'maghrib': 'text-rose-400 bg-rose-500/10',
  'isha': 'text-indigo-400 bg-indigo-500/10'
};

export function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCollection, setSelectedCollection] = useState<AdhkarCollection | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      const collection = ADHKAR_COLLECTIONS.find(c => c.category === category);
      if (collection) {
        setSelectedCollection(collection);
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);
  
  const progress = useLiveQuery(
    () => db.collectionProgress.where({ dateStr: todayStr }).toArray(),
    [todayStr]
  );

  const getProgress = (collectionId: string, itemIndex: number): number => {
    const record = progress?.find(p => p.collectionId === collectionId && p.itemIndex === itemIndex);
    return record?.currentCount || 0;
  };

  const getCollectionCompletion = (collection: AdhkarCollection): number => {
    let completed = 0;
    let total = 0;
    collection.items.forEach((item, index) => {
      total += item.target;
      completed += Math.min(getProgress(collection.id, index), item.target);
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleStartItem = async (collection: AdhkarCollection, itemIndex: number) => {
    const currentProgress = getProgress(collection.id, itemIndex);
    
    setActiveItemIndex(itemIndex);
    setItemCount(currentProgress);
  };

  const handleIncrement = async () => {
    if (!selectedCollection || activeItemIndex === null) return;
    
    const currentItem = selectedCollection.items[activeItemIndex];
    const newCount = itemCount + 1;
    setItemCount(newCount);
    
    if (navigator.vibrate) navigator.vibrate(15);
    
    const existing = await db.collectionProgress
      .where({ collectionId: selectedCollection.id, dateStr: todayStr, itemIndex: activeItemIndex })
      .first();
    
    if (existing) {
      await db.collectionProgress.update(existing.id!, { currentCount: newCount });
    } else {
      await db.collectionProgress.add({
        collectionId: selectedCollection.id,
        itemIndex: activeItemIndex,
        currentCount: newCount,
        dateStr: todayStr
      });
    }

    // Auto-advance when target reached
    if (newCount >= currentItem.target) {
      if (activeItemIndex < selectedCollection.items.length - 1) {
        // Move to next dhikr automatically
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setActiveItemIndex(activeItemIndex + 1);
        setItemCount(0);
      } else {
        // Last dhikr completed - show completion modal
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
        setShowCompletionModal(true);
      }
    }
  };

  const handleComplete = () => {
    setActiveItemIndex(null);
    setItemCount(0);
    setShowCompletionModal(false);
  };

  return (
    <div className="px-6 py-8 space-y-6 pb-32">
      <header>
        <h1 className="font-serif text-3xl text-slate-100">Adhkar</h1>
        <p className="text-slate-400 text-sm mt-1">Morning, Evening & Daily Supplications</p>
      </header>

      <AnimatePresence mode="wait">
        {!selectedCollection ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {ADHKAR_COLLECTIONS.map((collection) => {
              const Icon = categoryIcons[collection.category];
              const completion = getCollectionCompletion(collection);
              
              return (
                <motion.button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className="w-full glass-card rounded-2xl p-5 group relative overflow-hidden transition-transform active:scale-[0.98] text-left"
                >
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-gold-500/50 transition-all duration-1000"
                    style={{ width: `${completion}%` }}
                  />
                  
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", categoryColors[collection.category])}>
                      <Icon size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg text-slate-100 group-hover:text-gold-400 transition-colors">
                          {collection.title}
                        </h3>
                        <ChevronRight size={20} className="text-slate-500 group-hover:text-gold-400 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{collection.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md">
                          {collection.items.length} dhikr
                        </span>
                        {completion > 0 && (
                          <span className="text-[10px] text-gold-400 bg-gold-500/10 px-2 py-1 rounded-md">
                            {completion}% today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : activeItemIndex !== null ? (
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-[70vh] space-y-6"
          >
            <button 
              onClick={handleComplete}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={cn(
                "absolute top-4 right-14 p-2 rounded-full transition-colors",
                showTranslation ? "bg-gold-500/20 text-gold-400" : "bg-slate-800/50 text-slate-400 hover:text-white"
              )}
            >
              <Languages size={20} />
            </button>

            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold">
                {selectedCollection.title} • {activeItemIndex + 1}/{selectedCollection.items.length}
              </span>
              <h2 className="font-serif text-2xl text-white">
                {selectedCollection.items[activeItemIndex].title}
              </h2>
              {selectedCollection.items[activeItemIndex].arabic && (
                <p className="text-xl text-gold-400 font-arabic" dir="rtl">
                  {selectedCollection.items[activeItemIndex].arabic}
                </p>
              )}
              {showTranslation && (
                <p className="text-sm text-slate-400">
                  {selectedCollection.items[activeItemIndex].meaning}
                </p>
              )}
              {showTranslation && selectedCollection.items[activeItemIndex].virtue && (
                <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-medium">
                    ✨ {selectedCollection.items[activeItemIndex].virtue}
                  </p>
                </div>
              )}
            </div>

            {/* Counter with circular progress ring */}
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
                    className="text-gold-500 transition-all duration-300 ease-out" 
                    strokeWidth="2"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (301.59 * Math.min(100, (itemCount / selectedCollection.items[activeItemIndex].target) * 100)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <button
                onClick={handleIncrement}
                className="w-56 h-56 rounded-full bg-gradient-to-br from-midnight-800 to-midnight-950 shadow-[20px_20px_60px_#050812,-20px_-20px_60px_#1e293b] flex flex-col items-center justify-center border border-white/5 active:scale-[0.98] transition-all"
              >
                <span className="font-serif text-7xl text-gold-400 drop-shadow-2xl tabular-nums">
                  {itemCount}
                </span>
                <span className="text-slate-500 text-sm mt-2">
                  / {selectedCollection.items[activeItemIndex].target}
                </span>
              </button>
            </div>

            {/* Dhikr Progress Pills */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[90vw]">
              {selectedCollection.items.map((item, idx) => {
                const itemProgress = getProgress(selectedCollection.id, idx);
                const isCompleted = itemProgress >= item.target;
                const isActive = activeItemIndex === idx;
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all",
                      isActive && "bg-gold-500/20 text-gold-400 border border-gold-500/30",
                      !isActive && isCompleted && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                      !isActive && !isCompleted && "bg-slate-800/30 text-slate-500 border border-white/5"
                    )}
                  >
                    {isCompleted && <Check size={10} />}
                    <span>{item.title.substring(0, 10)}{item.title.length > 10 ? '...' : ''}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button 
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={20} className="rotate-180" />
              Back
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", categoryColors[selectedCollection.category])}>
                  {(() => { const Icon = categoryIcons[selectedCollection.category]; return <Icon size={24} />; })()}
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-slate-100">{selectedCollection.title}</h2>
                  <p className="text-sm text-slate-400">{selectedCollection.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showTranslation ? "bg-gold-500/20 text-gold-400" : "bg-slate-800/50 text-slate-500"
                )}
              >
                <Languages size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {selectedCollection.items.map((item, index) => {
                const progress = getProgress(selectedCollection.id, index);
                const isComplete = progress >= item.target;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleStartItem(selectedCollection, index)}
                    className={cn(
                      "w-full glass-card rounded-xl p-4 text-left transition-all active:scale-[0.98]",
                      isComplete && "border-gold-500/30 bg-gold-500/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-mono">{index + 1}.</span>
                          <h3 className={cn(
                            "font-medium",
                            isComplete ? "text-gold-400" : "text-slate-200"
                          )}>
                            {item.title}
                          </h3>
                          {isComplete && <Check size={14} className="text-gold-400" />}
                        </div>
                        {item.arabic && (
                          <p className="text-lg text-gold-400/80 font-arabic mt-1" dir="rtl">
                            {item.arabic}
                          </p>
                        )}
                        {showTranslation && (
                          <p className="text-xs text-slate-500 mt-1">{item.meaning}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          isComplete ? "text-gold-400" : "text-slate-300"
                        )}>
                          {Math.min(progress, item.target)} / {item.target}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isComplete ? "bg-gold-500" : "bg-gold-500/50"
                        )}
                        style={{ width: `${Math.min(100, (progress / item.target) * 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && selectedCollection && (
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
              <h3 className="font-serif text-2xl text-slate-100 mb-2">Alhamdulillah! 🎉</h3>
              <p className="text-slate-400 mb-4">
                You have completed all adhkar for <span className="text-gold-400 font-medium">{selectedCollection.title}</span>
              </p>
              <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                <p className="text-sm text-slate-300">
                  <span className="text-emerald-400 font-bold">{selectedCollection.items.length}</span> adhkar completed
                </p>
              </div>
              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-xl bg-gold-500 text-midnight-950 font-bold hover:bg-gold-400 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
