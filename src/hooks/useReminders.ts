import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { differenceInMinutes, getDay, format } from 'date-fns';
import { getStoredReminders } from '../lib/reminders';

export function useReminders() {
  const activeTargets = useLiveQuery(() => 
    db.targets.where('status').equals('active').toArray()
  );

  const processingRef = useRef(false);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      if (processingRef.current || Notification.permission !== 'granted') return;
      processingRef.current = true;

      const now = new Date();
      const currentDay = getDay(now);
      const currentTimeStr = format(now, 'HH:mm');

      // Check daily reminders
      const dailyReminders = getStoredReminders();
      for (const reminder of dailyReminders) {
        if (reminder.enabled && reminder.time === currentTimeStr) {
          new Notification(`Tasbih Reminder - ${reminder.name}`, {
            body: reminder.message,
            icon: '/pwa-192x192.png',
            tag: `reminder-${reminder.id}`
          });
        }
      }

      // Check goal-based reminders
      if (activeTargets) {
        for (const target of activeTargets) {
          let shouldNotify = false;
          let notificationBody = `Reminder: ${target.title}`;

          if (target.reminderType === 'one-off' && target.reminderGap && target.startTime && target.currentCount === 0) {
            // @ts-expect-error - hasNotifiedDelay is dynamically added
            if (!target.hasNotifiedDelay) {
              const minutesLate = differenceInMinutes(now, target.startTime);
              if (minutesLate >= target.reminderGap) {
                shouldNotify = true;
                notificationBody = `You haven't started your goal of ${target.targetCount} yet!`;
                // @ts-expect-error - hasNotifiedDelay is dynamically added
                await db.targets.update(target.id!, { hasNotifiedDelay: true });
              }
            }
          }

          else if (target.reminderType === 'recurring' && target.reminderTime) {
            if (target.reminderTime === currentTimeStr) {
              const isCorrectDay = target.frequency === 'daily' || 
                (target.frequency === 'weekly' && target.reminderDays?.includes(currentDay));

              if (isCorrectDay) {
                const last = target.lastNotified;
                const alreadyNotifiedToday = last && 
                  last.getDate() === now.getDate() && 
                  last.getMonth() === now.getMonth() && 
                  last.getFullYear() === now.getFullYear();

                if (!alreadyNotifiedToday) {
                  shouldNotify = true;
                  notificationBody = `It's time for your ${target.frequency} Zikr: ${target.title}`;
                  await db.targets.update(target.id!, { lastNotified: now });
                }
              }
            }
          }

          if (shouldNotify) {
            new Notification(`Tasbih Reminder`, {
              body: notificationBody,
              icon: '/pwa-192x192.png',
              tag: `target-${target.id}`
            });
          }
        }
      }
      
      processingRef.current = false;
    };

    const intervalId = setInterval(checkReminders, 20000);
    return () => clearInterval(intervalId);
  }, [activeTargets]);
}
