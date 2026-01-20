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
  createdAt: Date;
  status: 'active' | 'completed' | 'archived';
}

const db = new Dexie('IslamicCounterDB') as Dexie & {
  logs: EntityTable<Log, 'id'>;
  targets: EntityTable<Target, 'id'>;
};

db.version(1).stores({
  logs: '++id, targetId, dateStr, timestamp',
  targets: '++id, status, deadline'
});

export type { Log, Target };
export { db };
