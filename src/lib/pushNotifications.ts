export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  primaryKey?: number;
}

const VAPID_PUBLIC_KEY = 'REMOVED_VAPID_PUBLIC_KEY==';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getApplicationServerKey(): Uint8Array {
  return urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      return existingSubscription.toJSON() as PushSubscriptionData;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: getApplicationServerKey().buffer as ArrayBuffer
    });

    const subscriptionData = subscription.toJSON() as PushSubscriptionData;
    
    // Store subscription locally
    localStorage.setItem('push-subscription', JSON.stringify(subscriptionData));
    
    return subscriptionData;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getPushSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      localStorage.removeItem('push-subscription');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // This would typically be sent to your backend server
    // which would then send it to the push service
    // For now, we'll store it for later processing
    const notifications = JSON.parse(localStorage.getItem('pending-notifications') || '[]');
    notifications.push({
      subscription,
      payload,
      scheduledFor: new Date().toISOString()
    });
    localStorage.setItem('pending-notifications', JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  scheduledTime: Date,
  url?: string
): Promise<void> {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();
  
  if (delay <= 0) return;

  const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled-notifications') || '[]');
  const notificationId = Date.now().toString();
  
  scheduledNotifications.push({
    id: notificationId,
    title,
    body,
    url,
    scheduledFor: scheduledTime.toISOString()
  });
  
  localStorage.setItem('scheduled-notifications', JSON.stringify(scheduledNotifications));
}

export function getScheduledNotifications(): Array<{
  id: string;
  title: string;
  body: string;
  url?: string;
  scheduledFor: string;
}> {
  return JSON.parse(localStorage.getItem('scheduled-notifications') || '[]');
}

export function clearScheduledNotifications(): void {
  localStorage.setItem('scheduled-notifications', '[]');
}

export function checkAndShowNotifications(): void {
  const scheduled = getScheduledNotifications();
  const now = new Date();
  
  const due = scheduled.filter(n => new Date(n.scheduledFor) <= now);
  const upcoming = scheduled.filter(n => new Date(n.scheduledFor) > now);
  
  due.forEach(notification => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          data: { url: notification.url || '/' }
        });
      });
    }
  });
  
  localStorage.setItem('scheduled-notifications', JSON.stringify(upcoming));
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Appwrite Integration
export async function saveSubscriptionToBackend(
  subscription: PushSubscriptionData,
  reminders: Array<{ id: string; name: string; time: string; enabled: boolean }>
): Promise<boolean> {
  try {
    const { isAppwriteConfigured, APPWRITE_CONFIG } = await import('./appwrite');
    
    if (!isAppwriteConfigured()) {
      console.warn('Appwrite not configured - saving locally only');
      return true;
    }
    
    const userId = localStorage.getItem('appwrite-user-id') || 'anonymous';
    
    // Call Appwrite Function
    const response = await fetch(`${APPWRITE_CONFIG.endpoint}/functions/${APPWRITE_CONFIG.functionId}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId
      },
      body: JSON.stringify({
        action: 'subscribe',
        userId,
        subscription,
        reminders
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save subscription to backend:', error);
    return false;
  }
}

export async function removeSubscriptionFromBackend(): Promise<boolean> {
  try {
    const { isAppwriteConfigured, APPWRITE_CONFIG } = await import('./appwrite');
    
    if (!isAppwriteConfigured()) return true;
    
    const userId = localStorage.getItem('appwrite-user-id') || 'anonymous';
    
    const response = await fetch(`${APPWRITE_CONFIG.endpoint}/functions/${APPWRITE_CONFIG.functionId}/executions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId
      },
      body: JSON.stringify({
        action: 'unsubscribe',
        userId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to remove subscription from backend:', error);
    return false;
  }
}

export async function sendTestNotification(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    
    // Vibrate on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    
    // Play selected sound
    const { playNotificationSound } = await import('./sounds');
    playNotificationSound();
    
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(' Tasbih Test', {
      body: 'Test notification from Tasbih PWA',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
      silent: true,
      data: { url: '/' }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return false;
  }
}
