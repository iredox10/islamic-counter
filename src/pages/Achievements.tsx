import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ACHIEVEMENTS, type Achievement } from '../lib/achievements';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function Achievements() {
  const unlockedAchievements = useLiveQuery(() => db.achievements.toArray());
  
  const unlockedMap = new Map(
    unlockedAchievements?.map(a => [a.achievementId, a.unlockedAt]) || []
  );

  const categorizedAchievements = {
    count: ACHIEVEMENTS.filter(a => a.category === 'count'),
    streak: ACHIEVEMENTS.filter(a => a.category === 'streak'),
    goal: ACHIEVEMENTS.filter(a => a.category === 'goal'),
    time: ACHIEVEMENTS.filter(a => a.category === 'time'),
    special: ACHIEVEMENTS.filter(a => a.category === 'special'),
  };

  const totalUnlocked = unlockedAchievements?.length || 0;
  const totalAchievements = ACHIEVEMENTS.length;
  const progressPercent = (totalUnlocked / totalAchievements) * 100;

  return (
    <div className="px-6 py-8 space-y-8 pb-32">
      <header>
        <h1 className="font-serif text-3xl text-slate-100">Achievements</h1>
        <p className="text-slate-400 text-sm mt-1">Your spiritual milestones</p>
      </header>

      {/* Progress Overview */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gold-500/10">
              <Trophy className="text-gold-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalUnlocked} / {totalAchievements}</p>
              <p className="text-xs text-slate-400">Achievements Unlocked</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gold-400">{Math.round(progressPercent)}%</p>
            <p className="text-[10px] text-slate-500">Complete</p>
          </div>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
          />
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-6">
        <AchievementCategory 
          title="Count Milestones" 
          achievements={categorizedAchievements.count}
          unlockedMap={unlockedMap}
        />
        <AchievementCategory 
          title="Streak Mastery" 
          achievements={categorizedAchievements.streak}
          unlockedMap={unlockedMap}
        />
        <AchievementCategory 
          title="Goal Achiever" 
          achievements={categorizedAchievements.goal}
          unlockedMap={unlockedMap}
        />
        <AchievementCategory 
          title="Special Moments" 
          achievements={[...categorizedAchievements.time, ...categorizedAchievements.special]}
          unlockedMap={unlockedMap}
        />
      </div>
    </div>
  );
}

function AchievementCategory({ 
  title, 
  achievements, 
  unlockedMap 
}: { 
  title: string; 
  achievements: Achievement[]; 
  unlockedMap: Map<string, Date>;
}) {
  return (
    <section>
      <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-3">{title}</h2>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map(achievement => {
          const unlockedAt = unlockedMap.get(achievement.id);
          const isUnlocked = !!unlockedAt;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "glass-card rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden",
                isUnlocked && "border-gold-500/30"
              )}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-gold-500/10 rounded-bl-full" />
              )}
              
              <div className={cn(
                "text-3xl mb-2 transition-all",
                isUnlocked ? "" : "grayscale opacity-40"
              )}>
                {achievement.icon}
              </div>
              
              <h3 className={cn(
                "text-xs font-bold leading-tight",
                isUnlocked ? "text-slate-100" : "text-slate-500"
              )}>
                {achievement.title}
              </h3>
              
              {isUnlocked ? (
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="text-gold-400" />
                  <span className="text-[10px] text-gold-400">
                    {format(unlockedAt, 'MMM d')}
                  </span>
                </div>
              ) : (
                <Lock size={12} className="text-slate-600 mt-1" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
