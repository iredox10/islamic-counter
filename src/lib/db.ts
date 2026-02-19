import Dexie, { type EntityTable } from 'dexie';

interface Log {
  id: number;
  count: number;
  targetId?: number;
  timestamp: Date;
  dateStr: string;
}

interface Target {
  id: number;
  title: string;
  targetCount: number;
  currentCount: number;
  deadline?: Date;
  startTime?: Date;
  
  reminderType?: 'one-off' | 'recurring';
  reminderGap?: number;
  
  frequency?: 'daily' | 'weekly';
  reminderTime?: string;
  reminderDays?: number[];
  
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

interface PrayerCompletion {
  id?: number;
  prayer: string;
  dateStr: string;
  completedAt: Date;
  totalAdhkar: number;
  completedAdhkar: number;
}

interface AdhkarSession {
  id?: number;
  collectionId: string;
  collectionName: string;
  dateStr: string;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds: number;
  totalItems: number;
  completedItems: number;
  totalCounts: number;
}

interface AdhkarStreak {
  id?: number;
  collectionId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

interface AdhkarJournal {
  id?: number;
  dateStr: string;
  collectionId: string;
  collectionName: string;
  dhikrName: string;
  dhikrArabic?: string;
  count: number;
  target: number;
  completedAt: Date;
  notes?: string;
}

const db = new Dexie('IslamicCounterDB') as Dexie & {
  logs: EntityTable<Log, 'id'>;
  targets: EntityTable<Target, 'id'>;
  durations: EntityTable<Duration, 'id'>;
  collectionProgress: EntityTable<CollectionProgress, 'id'>;
  achievements: EntityTable<UnlockedAchievement, 'id'>;
  prayerCompletions: EntityTable<PrayerCompletion, 'id'>;
  adhkarSessions: EntityTable<AdhkarSession, 'id'>;
  adhkarStreaks: EntityTable<AdhkarStreak, 'id'>;
  adhkarJournal: EntityTable<AdhkarJournal, 'id'>;
};

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
  durations: '++id, [dateStr+targetId]'
});

db.version(5).stores({
  collectionProgress: '++id, [collectionId+dateStr+itemIndex], collectionId, dateStr'
});

db.version(6).stores({
  achievements: '++id, achievementId, unlockedAt'
});

db.version(7).stores({
  prayerCompletions: '++id, [prayer+dateStr], prayer, dateStr'
});

db.version(8).stores({
  adhkarSessions: '++id, collectionId, dateStr, startedAt, completedAt',
  adhkarStreaks: '++id, collectionId',
  adhkarJournal: '++id, dateStr, collectionId, completedAt, [dateStr+collectionId]'
});

export type { Log, Target, Duration, CollectionProgress, UnlockedAchievement, PrayerCompletion, AdhkarSession, AdhkarStreak, AdhkarJournal };
export { db };
