import { db, type AdhkarSession, type AdhkarStreak, type AdhkarJournal } from './db';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';

export interface AdhkarSessionData {
  collectionId: string;
  collectionName: string;
  totalItems: number;
}

export interface JournalEntry {
  dhikrName: string;
  dhikrArabic?: string;
  count: number;
  target: number;
}

let currentSession: {
  id?: number;
  collectionId: string;
  collectionName: string;
  startedAt: Date;
  totalItems: number;
  completedItems: number;
  totalCounts: number;
  journalEntries: JournalEntry[];
} | null = null;

export function startAdhkarSession(data: AdhkarSessionData): void {
  currentSession = {
    collectionId: data.collectionId,
    collectionName: data.collectionName,
    startedAt: new Date(),
    totalItems: data.totalItems,
    completedItems: 0,
    totalCounts: 0,
    journalEntries: []
  };
}

export function recordDhikrCompletion(
  dhikrName: string,
  dhikrArabic: string | undefined,
  count: number,
  target: number
): void {
  if (!currentSession) return;
  
  currentSession.completedItems++;
  currentSession.totalCounts += count;
  currentSession.journalEntries.push({
    dhikrName,
    dhikrArabic,
    count,
    target
  });
}

export async function endAdhkarSession(completed: boolean = true): Promise<AdhkarSession | null> {
  if (!currentSession) return null;
  
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const completedAt = completed ? new Date() : undefined;
  const durationSeconds = Math.floor((Date.now() - currentSession.startedAt.getTime()) / 1000);
  
  const session: Omit<AdhkarSession, 'id'> = {
    collectionId: currentSession.collectionId,
    collectionName: currentSession.collectionName,
    dateStr,
    startedAt: currentSession.startedAt,
    completedAt,
    durationSeconds,
    totalItems: currentSession.totalItems,
    completedItems: currentSession.completedItems,
    totalCounts: currentSession.totalCounts
  };
  
  const sessionId = await db.adhkarSessions.add(session);
  
  if (completed && currentSession.completedItems === currentSession.totalItems) {
    await updateStreak(currentSession.collectionId, dateStr);
  }
  
  const journalPromises = currentSession.journalEntries.map(entry => 
    db.adhkarJournal.add({
      dateStr,
      collectionId: currentSession!.collectionId,
      collectionName: currentSession!.collectionName,
      dhikrName: entry.dhikrName,
      dhikrArabic: entry.dhikrArabic,
      count: entry.count,
      target: entry.target,
      completedAt: new Date()
    })
  );
  await Promise.all(journalPromises);
  
  const savedSession = { ...session, id: sessionId };
  currentSession = null;
  
  return savedSession;
}

export function cancelAdhkarSession(): void {
  currentSession = null;
}

export function getCurrentSession() {
  return currentSession;
}

async function updateStreak(collectionId: string, dateStr: string): Promise<void> {
  const existing = await db.adhkarStreaks.where('collectionId').equals(collectionId).first();
  
  if (!existing) {
    await db.adhkarStreaks.add({
      collectionId,
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: dateStr
    });
    return;
  }
  
  const lastDate = parseISO(existing.lastCompletedDate);
  const today = parseISO(dateStr);
  const daysDiff = differenceInDays(today, lastDate);
  
  let newCurrentStreak: number;
  
  if (daysDiff === 0) {
    newCurrentStreak = existing.currentStreak;
  } else if (daysDiff === 1) {
    newCurrentStreak = existing.currentStreak + 1;
  } else {
    newCurrentStreak = 1;
  }
  
  await db.adhkarStreaks.update(existing.id!, {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(existing.longestStreak, newCurrentStreak),
    lastCompletedDate: dateStr
  });
}

export async function getStreak(collectionId: string): Promise<AdhkarStreak | undefined> {
  return db.adhkarStreaks.where('collectionId').equals(collectionId).first();
}

export async function getAllStreaks(): Promise<AdhkarStreak[]> {
  return db.adhkarStreaks.toArray();
}

export async function getSessionHistory(limit: number = 30): Promise<AdhkarSession[]> {
  return db.adhkarSessions
    .orderBy('startedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getSessionsByDate(dateStr: string): Promise<AdhkarSession[]> {
  return db.adhkarSessions.where('dateStr').equals(dateStr).toArray();
}

export async function getSessionsByCollection(collectionId: string, limit: number = 30): Promise<AdhkarSession[]> {
  return db.adhkarSessions
    .where('collectionId')
    .equals(collectionId)
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getJournalByDate(dateStr: string): Promise<AdhkarJournal[]> {
  return db.adhkarJournal.where('dateStr').equals(dateStr).toArray();
}

export async function getJournalByDateRange(startDate: Date, endDate: Date): Promise<AdhkarJournal[]> {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  const allJournal = await db.adhkarJournal.toArray();
  return allJournal.filter(j => j.dateStr >= startDateStr && j.dateStr <= endDateStr);
}

export async function getJournalHistory(limit: number = 100): Promise<AdhkarJournal[]> {
  return db.adhkarJournal
    .orderBy('completedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getDailySummary(dateStr: string): Promise<{
  sessions: AdhkarSession[];
  journal: AdhkarJournal[];
  totalCounts: number;
  totalDuration: number;
  collectionsCompleted: number;
}> {
  const sessions = await getSessionsByDate(dateStr);
  const journal = await getJournalByDate(dateStr);
  
  const totalCounts = sessions.reduce((sum, s) => sum + s.totalCounts, 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const collectionsCompleted = sessions.filter(s => s.completedItems === s.totalItems).length;
  
  return {
    sessions,
    journal,
    totalCounts,
    totalDuration,
    collectionsCompleted
  };
}

export async function getWeeklySummary(): Promise<{
  days: Array<{
    dateStr: string;
    totalCounts: number;
    totalDuration: number;
    sessionsCount: number;
  }>;
  totalCounts: number;
  totalDuration: number;
  totalSessions: number;
}> {
  const days: Array<{ dateStr: string; totalCounts: number; totalDuration: number; sessionsCount: number }> = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessions = await getSessionsByDate(dateStr);
    
    days.push({
      dateStr,
      totalCounts: sessions.reduce((sum, s) => sum + s.totalCounts, 0),
      totalDuration: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      sessionsCount: sessions.length
    });
  }
  
  return {
    days,
    totalCounts: days.reduce((sum, d) => sum + d.totalCounts, 0),
    totalDuration: days.reduce((sum, d) => sum + d.totalDuration, 0),
    totalSessions: days.reduce((sum, d) => sum + d.sessionsCount, 0)
  };
}

export async function exportHistory(format: 'json' | 'csv' = 'json'): Promise<string> {
  const sessions = await db.adhkarSessions.toArray();
  const journal = await db.adhkarJournal.toArray();
  const streaks = await db.adhkarStreaks.toArray();
  
  const data = {
    exportedAt: new Date().toISOString(),
    sessions,
    journal,
    streaks
  };
  
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  const csvRows: string[] = [];
  csvRows.push('Date,Collection,Dhikr,Count,Target,Completed At');
  
  for (const entry of journal) {
    csvRows.push(`${entry.dateStr},"${entry.collectionName}","${entry.dhikrName}",${entry.count},${entry.target},${entry.completedAt}`);
  }
  
  return csvRows.join('\n');
}
