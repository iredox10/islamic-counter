import { useEffect, useRef } from 'react';
import { db } from './db';
import { checkAchievements, ACHIEVEMENTS } from './achievements';
import { gregorianToHijri, SPECIAL_ISLAMIC_DAYS } from './hijri';

export function useAchievementTracker(
  totalCount: number,
  currentStreak: number,
  completedGoals: number,
  sessionCount: number
) {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (totalCount === 0 && sessionCount === 0) return;

    const checkAndUnlock = async () => {
      const unlocked = await db.achievements.toArray();
      const unlockedIds = unlocked.map(a => a.achievementId);

      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      const hijriDate = gregorianToHijri(now);
      const isEid = SPECIAL_ISLAMIC_DAYS.some(
        d => d.hijriMonth === hijriDate.month && d.hijriDay === hijriDate.day && 
             (d.name.includes('Eid'))
      );
      
      const isRamadan = hijriDate.month === 9;

      const timeOfDay = {
        isFajr: hour >= 5 && hour < 7,
        isAfterIsha: hour >= 20 || hour < 5,
        isFriday: dayOfWeek === 5,
        isRamadan,
        isEid
      };

      const newlyUnlocked = checkAchievements(
        totalCount,
        currentStreak,
        completedGoals,
        sessionCount,
        timeOfDay,
        unlockedIds
      );

      for (const achievement of newlyUnlocked) {
        await db.achievements.add({
          achievementId: achievement.id,
          unlockedAt: new Date()
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Achievement Unlocked! 🏆', {
            body: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
            icon: '/pwa-192x192.png'
          });
        }
      }
    };

    checkAndUnlock();
    hasCheckedRef.current = true;
  }, [totalCount, currentStreak, completedGoals, sessionCount]);
}

export function getProgressTowardsNext(
  achievementId: string,
  current: number
): { current: number; target: number; percent: number } | null {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;
  
  return {
    current,
    target: achievement.requirement,
    percent: Math.min(100, (current / achievement.requirement) * 100)
  };
}
