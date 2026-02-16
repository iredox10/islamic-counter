import { Client, Databases } from 'appwrite';

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

export const appwriteClient = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(appwriteClient);

export const DATABASE_ID = 'tasbih';
export const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions';
export const NOTIFICATION_LOGS_COLLECTION = 'notification_logs';

export const APPWRITE_CONFIG = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  functionId: import.meta.env.VITE_APPWRITE_PUSH_FUNCTION_ID || ''
};

export function isAppwriteConfigured(): boolean {
  return !!APPWRITE_PROJECT_ID;
}
