import Dexie, { type EntityTable } from 'dexie';

interface Log {
  id: number;
  count: number;
  targetId?: number;
  timestamp: Date;
  dateStr: string; // YYYY-MM-DD
}

interface Target {
  id: number;
  title: string;
  targetCount: number;
  currentCount: number;
  deadline?: Date;
  startTime?: Date;
  
  // Reminder Settings
  reminderType?: 'one-off' | 'recurring';
  reminderGap?: number; // Minutes late (for one-off)
  
  // Recurring Settings
  frequency?: 'daily' | 'weekly';
  reminderTime?: string; // "14:30"
  reminderDays?: number[]; // [0-6] where 0 is Sunday
  
  lastNotified?: Date;
  createdAt: Date;
  status: 'active' | 'completed' | 'archived';
}

interface Duration {
  id?: number;
  dateStr: string;
  targetId?: number;
  seconds: number;
}

interface CollectionProgress {
  id?: number;
  collectionId: string;
  itemIndex: number;
  currentCount: number;
  dateStr: string;
}

interface UnlockedAchievement {
  id?: number;
  achievementId: string;
  unlockedAt: Date;
}

const db = new Dexie('IslamicCounterDB') as Dexie & {
  logs: EntityTable<Log, 'id'>;
  targets: EntityTable<Target, 'id'>;
  durations: EntityTable<Duration, 'id'>;
  collectionProgress: EntityTable<CollectionProgress, 'id'>;
  achievements: EntityTable<UnlockedAchievement, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  logs: '++id, targetId, dateStr, timestamp',
  targets: '++id, status, deadline'
});

db.version(2).stores({
  targets: '++id, status, deadline, startTime'
});

db.version(3).stores({
  targets: '++id, status, deadline, startTime, reminderType, frequency'
});

db.version(4).stores({
  durations: '++id, [dateStr+targetId]' // Compound index for fast lookups
});

db.version(5).stores({
  collectionProgress: '++id, [collectionId+dateStr+itemIndex], collectionId, dateStr'
});

db.version(6).stores({
  achievements: '++id, achievementId, unlockedAt'
});

export type { Log, Target, Duration, CollectionProgress, UnlockedAchievement };
export { db };
