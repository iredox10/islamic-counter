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
