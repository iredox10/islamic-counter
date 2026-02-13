import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { PRAYERS, type PrayerName } from '../lib/adhkar';
import { cn } from '../lib/utils';
import { Check, Circle } from 'lucide-react';

interface PrayerTrackerProps {
  todayStr: string;
  onSelectPrayer: (prayer: PrayerName) => void;
  activePrayer: PrayerName | null;
}

export function PrayerTracker({ todayStr, onSelectPrayer, activePrayer }: PrayerTrackerProps) {
  const todayCompletions = useLiveQuery(
    () => db.prayerCompletions.where('dateStr').equals(todayStr).toArray(),
    [todayStr]
  );

  const completedPrayers = new Set(todayCompletions?.map(c => c.prayer) || []);

  return (
    <div className="w-full px-4 py-3 bg-slate-900/30 rounded-xl border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">Today's Prayers</span>
        <span className="text-xs text-gold-400 font-bold">{completedPrayers.size}/5</span>
      </div>
      <div className="flex justify-between gap-1">
        {PRAYERS.map((prayer) => {
          const isCompleted = completedPrayers.has(prayer.id);
          const isActive = activePrayer === prayer.id;
          
          return (
            <button
              key={prayer.id}
              onClick={() => onSelectPrayer(prayer.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all flex-1",
                isActive && "bg-gold-500/20 border border-gold-500/30",
                !isActive && isCompleted && "bg-emerald-500/10 border border-emerald-500/20",
                !isActive && !isCompleted && "bg-slate-800/30 border border-white/5 hover:bg-slate-800/50"
              )}
            >
              <span className="text-[10px] font-arabic text-slate-300">{prayer.arabicName}</span>
              {isCompleted ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Circle size={14} className={cn(isActive ? "text-gold-400" : "text-slate-500")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
