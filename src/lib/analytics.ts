import { databases, DATABASE_ID, isAppwriteConfigured, ANALYTICS_SESSIONS_COLLECTION, ANALYTICS_EVENTS_COLLECTION } from './appwrite';
import { ID } from 'appwrite';

const DEVICE_ID_KEY = 'tasbih_device_id';
const SESSION_ID_KEY = 'tasbih_session_id';
const SESSION_START_KEY = 'tasbih_session_start';

function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  return sessionId;
}

export interface AnalyticsEvent {
  type: 'page_view' | 'counter_use' | 'prayer_complete' | 'target_create' | 'target_complete' | 'achievement_unlock' | 'notification_received' | 'reminder_set' | 'export_data' | 'theme_change' | 'language_change' | 'error';
  page?: string;
  metadata?: Record<string, unknown>;
}

let sessionTracked = false;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function initAnalytics(): void {
  if (!isAppwriteConfigured()) return;
  
  const sessionId = getSessionId();
  const deviceId = getDeviceId();
  
  if (!sessionTracked) {
    sessionTracked = true;
    trackSessionStart(sessionId, deviceId);
    setupSessionTracking(sessionId, deviceId);
  }
  
  startHeartbeat(sessionId);
  
  window.addEventListener('beforeunload', () => {
    endSession(sessionId);
  });
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      endSession(sessionId);
    } else {
      const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
      trackSessionStart(newSessionId, deviceId);
      startHeartbeat(newSessionId);
    }
  });
}

async function trackSessionStart(sessionId: string, deviceId: string): Promise<void> {
  try {
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now().toString());
    
    await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_SESSIONS_COLLECTION,
      sessionId,
      {
        deviceId,
        sessionId,
        startedAt: new Date(sessionStart).toISOString(),
        lastActivity: new Date().toISOString(),
        duration: 0,
        pageViews: 1,
        platform: getPlatform(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
      }
    );
  } catch (error) {
    console.warn('Analytics session start failed:', error);
  }
}

function setupSessionTracking(_sessionId: string, _deviceId: string): void {
  document.addEventListener('click', () => {
  });
  
  document.addEventListener('scroll', () => {
  });
}

function startHeartbeat(sessionId: string): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(() => {
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now().toString());
    const duration = Math.floor((Date.now() - sessionStart) / 1000);
    
    if (duration > 0 && duration % 60 === 0) {
      updateSessionDuration(sessionId, duration);
    }
  }, 60000);
}

async function updateSessionDuration(sessionId: string, duration: number): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      ANALYTICS_SESSIONS_COLLECTION,
      sessionId,
      {
        duration,
        lastActivity: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.warn('Analytics heartbeat failed:', error);
  }
}

async function endSession(sessionId: string): Promise<void> {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now().toString());
  const duration = Math.floor((Date.now() - sessionStart) / 1000);
  
  if (navigator.sendBeacon) {
    const payload = JSON.stringify({
      databaseId: DATABASE_ID,
      collectionId: ANALYTICS_SESSIONS_COLLECTION,
      documentId: sessionId,
      data: { duration, lastActivity: new Date().toISOString() }
    });
    
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(`${import.meta.env.VITE_APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${ANALYTICS_SESSIONS_COLLECTION}/documents/${sessionId}`, blob);
  } else {
    updateSessionDuration(sessionId, duration);
  }
}

function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Win/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'unknown';
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (!isAppwriteConfigured()) return;
  
  try {
    const deviceId = getDeviceId();
    const sessionId = getSessionId();
    
    await databases.createDocument(
      DATABASE_ID,
      ANALYTICS_EVENTS_COLLECTION,
      ID.unique(),
      {
        deviceId,
        sessionId,
        type: event.type,
        page: event.page || window.location.pathname,
        metadata: JSON.stringify(event.metadata || {}),
        timestamp: new Date().toISOString(),
      }
    );
    
    if (event.type === 'page_view') {
      try {
        const sessionDoc = await databases.getDocument(
          DATABASE_ID,
          ANALYTICS_SESSIONS_COLLECTION,
          sessionId
        );
        await databases.updateDocument(
          DATABASE_ID,
          ANALYTICS_SESSIONS_COLLECTION,
          sessionId,
          { pageViews: (sessionDoc.pageViews || 1) + 1 }
        );
      } catch {
      }
    }
  } catch (error) {
    console.warn('Analytics event track failed:', error);
  }
}

export function trackPageView(page: string): void {
  trackEvent({ type: 'page_view', page });
}

export function trackCounterUse(dhikrName: string, count: number, isPrayerMode: boolean): void {
  trackEvent({
    type: 'counter_use',
    metadata: { dhikrName, count, isPrayerMode }
  });
}

export function trackPrayerComplete(prayer: string, adhkarCount: number): void {
  trackEvent({
    type: 'prayer_complete',
    metadata: { prayer, adhkarCount }
  });
}

export function trackTargetCreate(targetDays: number, targetCount: number): void {
  trackEvent({
    type: 'target_create',
    metadata: { targetDays, targetCount }
  });
}

export function trackTargetComplete(targetDays: number, totalDays: number): void {
  trackEvent({
    type: 'target_complete',
    metadata: { targetDays, totalDays }
  });
}

export function trackAchievementUnlock(achievementId: string, achievementName: string): void {
  trackEvent({
    type: 'achievement_unlock',
    metadata: { achievementId, achievementName }
  });
}

export function trackError(errorType: string, errorMessage: string): void {
  trackEvent({
    type: 'error',
    metadata: { errorType, errorMessage }
  });
}

export { getDeviceId };
