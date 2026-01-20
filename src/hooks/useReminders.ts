import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { differenceInMinutes } from 'date-fns';

export function useReminders() {
  const activeTargets = useLiveQuery(() => 
    db.targets.where('status').equals('active').toArray()
  );

  useEffect(() => {
    // 1. Request Permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 2. Check Loop
    const intervalId = setInterval(async () => {
      if (Notification.permission !== 'granted' || !activeTargets) return;

      const now = new Date();

      for (const target of activeTargets) {
        // Condition: Has Start Time, Has Reminder Gap, Hasn't started yet (count 0)
        if (target.startTime && target.reminderMinutes && target.currentCount === 0) {
          
          const minutesSinceStart = differenceInMinutes(now, target.startTime);
          
          // Check if we passed the gap
          if (minutesSinceStart >= target.reminderMinutes) {
            
            // Check if we already notified (we'll store a hidden flag on the object)
            // @ts-ignore - Dynamic property
            if (!target.hasNotifiedDelay) {
              
              // Trigger Notification
              new Notification(`Time to start: ${target.title}`, {
                body: `You set a goal for ${target.targetCount} and haven't started yet!`,
                icon: '/pwa-192x192.png' // We'll assume this exists or use default
              });

              // Mark as notified in DB to prevent spam
              await db.targets.update(target.id!, {
                // @ts-ignore
                hasNotifiedDelay: true
              });
            }
          }
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [activeTargets]);
}
