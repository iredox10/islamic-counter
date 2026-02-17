export interface DailyReminder {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  isSalahTime: boolean;
  message: string;
}

export const SALAH_TIMES: DailyReminder[] = [
  {
    id: 'fajr',
    name: 'Fajr',
    time: '05:30',
    enabled: false,
    isSalahTime: true,
    message: 'Start your day with dhikr after Fajr'
  },
  {
    id: 'dhuhr',
    name: 'Dhuhr',
    time: '12:30',
    enabled: false,
    isSalahTime: true,
    message: 'Remember Allah after Dhuhr prayer'
  },
  {
    id: 'asr',
    name: 'Asr',
    time: '15:30',
    enabled: false,
    isSalahTime: true,
    message: 'Time for evening adhkar after Asr'
  },
  {
    id: 'maghrib',
    name: 'Maghrib',
    time: '18:30',
    enabled: false,
    isSalahTime: true,
    message: 'Evening adhkar time after Maghrib'
  },
  {
    id: 'isha',
    name: 'Isha',
    time: '20:00',
    enabled: false,
    isSalahTime: true,
    message: 'Night dhikr before sleep'
  }
];

export const DEFAULT_REMINDERS: DailyReminder[] = [
  {
    id: 'morning',
    name: 'Morning Adhkar',
    time: '06:00',
    enabled: false,
    isSalahTime: false,
    message: 'Don\'t forget your morning adhkar'
  },
  {
    id: 'evening',
    name: 'Evening Adhkar',
    time: '17:00',
    enabled: false,
    isSalahTime: false,
    message: 'Time for evening adhkar'
  }
];

const STORAGE_KEY = 'daily-reminders';

export function getStoredReminders(): DailyReminder[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [...SALAH_TIMES, ...DEFAULT_REMINDERS];
}

export function saveReminders(reminders: DailyReminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function updateReminder(reminders: DailyReminder[], id: string, updates: Partial<DailyReminder>): DailyReminder[] {
  return reminders.map(r => r.id === id ? { ...r, ...updates } : r);
}

export function scheduleReminderNotification(reminder: DailyReminder): void {
  if (!reminder.enabled) return;
  
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);
  
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const scheduled = getScheduledNotifications();
  const existingIndex = scheduled.findIndex(n => n.id === reminder.id);
  
  const notification = {
    id: reminder.id,
    title: `🕌 ${reminder.name}`,
    body: reminder.message,
    scheduledFor: scheduledTime.toISOString()
  };
  
  if (existingIndex >= 0) {
    scheduled[existingIndex] = notification;
  } else {
    scheduled.push(notification);
  }
  
  localStorage.setItem('scheduled-notifications', JSON.stringify(scheduled));
}

export function getScheduledNotifications(): Array<{
  id: string;
  title: string;
  body: string;
  scheduledFor: string;
}> {
  return JSON.parse(localStorage.getItem('scheduled-notifications') || '[]');
}

export function cancelReminderNotification(reminderId: string): void {
  const scheduled = getScheduledNotifications();
  const filtered = scheduled.filter(n => n.id !== reminderId);
  localStorage.setItem('scheduled-notifications', JSON.stringify(filtered));
}

export function scheduleAllEnabledReminders(): void {
  const reminders = getStoredReminders();
  reminders.filter(r => r.enabled).forEach(scheduleReminderNotification);
}

export function checkAndTriggerNotifications(): void {
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;
  
  const scheduled = getScheduledNotifications();
  const now = new Date();
  
  const due = scheduled.filter(n => new Date(n.scheduledFor) <= now);
  const upcoming = scheduled.filter(n => new Date(n.scheduledFor) > now);
  
  due.forEach(notification => {
    import('./sounds').then(({ playNotificationSound }) => {
      playNotificationSound();
    });
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: notification.id,
        silent: true,
        data: { url: '/' }
      });
    });
    
    const reminder = getStoredReminders().find(r => r.id === notification.id);
    if (reminder) {
      const nextTime = new Date(notification.scheduledFor);
      nextTime.setDate(nextTime.getDate() + 1);
      
      upcoming.push({
        ...notification,
        scheduledFor: nextTime.toISOString()
      });
    }
  });
  
  localStorage.setItem('scheduled-notifications', JSON.stringify(upcoming));
}

export function startNotificationChecker(): () => void {
  checkAndTriggerNotifications();
  scheduleAllEnabledReminders();
  
  const interval = setInterval(checkAndTriggerNotifications, 60000);
  
  return () => clearInterval(interval);
}
