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
  reminderMinutes?: number; // Notify if count is 0 after this many minutes past startTime
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

// Version 2 upgrade for new fields if needed (Dexie handles non-indexed fields automatically, but good practice)
db.version(2).stores({
  targets: '++id, status, deadline, startTime'
});

export type { Log, Target };
export { db };
