import { Client, Databases, ID } from 'node-appwrite';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'REMOVED_VAPID_PUBLIC_KEY==';
const VAPID_PRIVATE_KEY = 'REMOVED_VAPID_PRIVATE_KEY==';

webpush.setVapidDetails(
  'mailto:contact@tasbih.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'REMOVED_PROJECT_ID==')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);

  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
  }

  try {
    const body = JSON.parse(req.body || '{}');

    // Subscribe to push notifications
    if (req.method === 'POST' && body.action === 'subscribe') {
      const { userId, subscription, reminders } = body;
      
      try {
        // Try to update existing
        await databases.updateDocument(
          'tasbih',
          'push_subscriptions',
          userId,
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            reminders: JSON.stringify(reminders || [])
          }
        );
      } catch (e) {
        // Create new if doesn't exist
        await databases.createDocument(
          'tasbih',
          'push_subscriptions',
          userId,
          {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            reminders: JSON.stringify(reminders || [])
          }
        );
      }
      
      log('Subscription saved for:', userId);
      
      return res.json({ success: true, message: 'Subscription saved' }, 200, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    // Unsubscribe
    if (req.method === 'POST' && body.action === 'unsubscribe') {
      const { userId } = body;
      
      try {
        await databases.deleteDocument('tasbih', 'push_subscriptions', userId);
      } catch (e) {}
      
      log('Unsubscribed:', userId);
      
      return res.json({ success: true }, 200, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    // Send notification
    if (req.method === 'POST' && body.action === 'send') {
      const { subscription, notification } = body;
      
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        url: notification.url || '/'
      });

      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }, payload);
      
      log('Notification sent:', notification.title);
      
      return res.json({ success: true }, 200, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    return res.json({ error: 'Invalid request' }, 400, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error('Error:', err);
    return res.json({ 
      error: 'Internal server error',
      message: err.message || 'Unknown error'
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};
