import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { differenceInMinutes, getDay, format } from 'date-fns';

export function useReminders() {
  const activeTargets = useLiveQuery(() => 
    db.targets.where('status').equals('active').toArray()
  );

  // We use a ref to prevent race conditions in the interval
  const processingRef = useRef(false);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      if (processingRef.current || Notification.permission !== 'granted' || !activeTargets) return;
      processingRef.current = true;

      const now = new Date();
      const currentDay = getDay(now); // 0-6
      const currentTimeStr = format(now, 'HH:mm'); // "14:30"

      for (const target of activeTargets) {
        let shouldNotify = false;
        let notificationBody = `Reminder: ${target.title}`;

        // --- Logic 1: One-off "Late" Reminder ---
        if (target.reminderType === 'one-off' && target.reminderGap && target.startTime && target.currentCount === 0) {
           // Only notify if we haven't already
           // @ts-ignore
           if (!target.hasNotifiedDelay) {
             const minutesLate = differenceInMinutes(now, target.startTime);
             if (minutesLate >= target.reminderGap) {
               shouldNotify = true;
               notificationBody = `You haven't started your goal of ${target.targetCount} yet!`;
               
               // Flag as done
               await db.targets.update(target.id!, { hasNotifiedDelay: true } as any);
             }
           }
        }

        // --- Logic 2: Recurring Daily/Weekly Alarm ---
        else if (target.reminderType === 'recurring' && target.reminderTime) {
          // Check if time matches (simple minute precision)
          if (target.reminderTime === currentTimeStr) {
            
            // Filter by Day (if Weekly)
            const isCorrectDay = target.frequency === 'daily' || (target.frequency === 'weekly' && target.reminderDays?.includes(currentDay));

            if (isCorrectDay) {
              // Check if we ALREADY notified today to avoid spamming for the whole minute
              const last = target.lastNotified;
              const alreadyNotifiedToday = last && 
                last.getDate() === now.getDate() && 
                last.getMonth() === now.getMonth() && 
                last.getFullYear() === now.getFullYear();

              if (!alreadyNotifiedToday) {
                shouldNotify = true;
                notificationBody = `It's time for your ${target.frequency} Zikr: ${target.title}`;
                
                // Update lastNotified immediately
                await db.targets.update(target.id!, { lastNotified: now });
              }
            }
          }
        }

        // --- Execution ---
        if (shouldNotify) {
          new Notification(`Tasbih Reminder`, {
            body: notificationBody,
            icon: '/pwa-192x192.png',
            tag: `target-${target.id}` // Prevents duplicate stacking
          });
        }
      }
      
      processingRef.current = false;
    };

    // Check every 20 seconds to be safe around minute boundaries
    const intervalId = setInterval(checkReminders, 20000);

    return () => clearInterval(intervalId);
  }, [activeTargets]);
}
