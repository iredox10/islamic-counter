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

const db = new Dexie('IslamicCounterDB') as Dexie & {
  logs: EntityTable<Log, 'id'>;
  targets: EntityTable<Target, 'id'>;
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

export type { Log, Target };
export { db };
