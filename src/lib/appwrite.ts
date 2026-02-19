import { Client, Databases } from 'appwrite';

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

let _appwriteClient: Client | null = null;
let _databases: Databases | null = null;

function getAppwriteClient(): Client | null {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) return null;
  if (_appwriteClient) return _appwriteClient;
  
  try {
    _appwriteClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    return _appwriteClient;
  } catch {
    return null;
  }
}

function getDatabases(): Databases | null {
  if (_databases) return _databases;
  const client = getAppwriteClient();
  if (!client) return null;
  _databases = new Databases(client);
  return _databases;
}

export const appwriteClient = getAppwriteClient();
export const databases = getDatabases();

export const DATABASE_ID = 'tasbih';
export const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions';
export const NOTIFICATION_LOGS_COLLECTION = 'notification_logs';
export const ANALYTICS_SESSIONS_COLLECTION = 'analytics_sessions';
export const ANALYTICS_EVENTS_COLLECTION = 'analytics_events';

export const APPWRITE_CONFIG = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  functionId: import.meta.env.VITE_APPWRITE_PUSH_FUNCTION_ID || ''
};

export function isAppwriteConfigured(): boolean {
  return !!APPWRITE_ENDPOINT && !!APPWRITE_PROJECT_ID;
}
