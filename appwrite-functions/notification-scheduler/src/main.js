import { Client, Databases, ID, Query } from 'node-appwrite';
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
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toISOString().split('T')[0];
  
  log('Scheduler running at:', currentTime, 'UTC');

  try {
    // Get all subscriptions
    const subscriptions = await databases.listDocuments(
      'tasbih',
      'push_subscriptions',
      [Query.limit(100)]
    );
    
    let sentCount = 0;
    
    for (const sub of subscriptions.documents) {
      let reminders = [];
      try {
        reminders = JSON.parse(sub.reminders || '[]');
      } catch (e) {
        continue;
      }
      
      for (const reminder of reminders) {
        if (!reminder.enabled) continue;
        
        // Check if it's time for this reminder
        if (reminder.time === currentTime) {
          // Check if we haven't already sent it today
          const logs = await databases.listDocuments(
            'tasbih',
            'notification_logs',
            [
              Query.equal('userId', sub.userId),
              Query.equal('reminderId', reminder.id),
              Query.equal('sentAt', today)
            ]
          );
          
          if (logs.total === 0) {
            try {
              await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth
                }
              }, JSON.stringify({
                title: `🕌 ${reminder.name}`,
                body: reminder.message || 'Time for dhikr',
                url: '/'
              }));
              
              // Mark as sent
              await databases.createDocument(
                'tasbih',
                'notification_logs',
                ID.unique(),
                {
                  userId: sub.userId,
                  reminderId: reminder.id,
                  sentAt: today
                }
              );
              
              log(`Sent ${reminder.name} to ${sub.userId}`);
              sentCount++;
            } catch (e) {
              error('Failed to send:', e.message);
              
              // If subscription is invalid, delete it
              if (e.statusCode === 410) {
                await databases.deleteDocument('tasbih', 'push_subscriptions', sub.$id);
              }
            }
          }
        }
      }
    }

    return res.json({ 
      success: true, 
      processed: subscriptions.total,
      sent: sentCount,
      time: currentTime 
    });

  } catch (err) {
    error('Scheduler error:', err);
    return res.json({ 
      error: err.message 
    }, 500);
  }
};
