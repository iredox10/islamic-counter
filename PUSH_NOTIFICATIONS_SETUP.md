# Push Notifications Setup Guide

This app supports push notifications via Appwrite. Follow these steps to set it up.

## Prerequisites

- Appwrite Cloud account (free at https://cloud.appwrite.io) or self-hosted Appwrite
- VAPID keys (already generated below)

## VAPID Keys

```
Public Key:  REMOVED_VAPID_PUBLIC_KEY==
Private Key: REMOVED_VAPID_PRIVATE_KEY==
```

**⚠️ IMPORTANT:** Keep the private key secret! Never expose it in client-side code.

## Step 1: Create Appwrite Project

1. Go to https://cloud.appwrite.io
2. Create a new project called "Tasbih"
3. Copy the Project ID

## Step 2: Create Database Collections

In Appwrite Console, create a database called `tasbih` with these collections:

### Collection: `push_subscriptions`
| Attribute | Type | Required |
|-----------|------|----------|
| userId | String | Yes |
| endpoint | String | Yes |
| p256dh | String | Yes |
| auth | String | Yes |
| reminders | String (JSON) | No |
| createdAt | DateTime | No |

### Collection: `notification_logs`
| Attribute | Type | Required |
|-----------|------|----------|
| userId | String | Yes |
| reminderId | String | Yes |
| sentAt | DateTime | Yes |

## Step 3: Create Appwrite Functions

### Function 1: `push-notifications`
1. In Appwrite Console, go to Functions
2. Create a new function
3. Upload the code from `appwrite-functions/push-notifications/`
4. Set these environment variables:
   - `APPWRITE_ENDPOINT` = `https://cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID` = your-project-id
   - `APPWRITE_API_KEY` = your-api-key
5. Copy the Function ID

### Function 2: `notification-scheduler`
1. Create another function
2. Upload the code from `appwrite-functions/notification-scheduler/`
3. Set the same environment variables
4. Add a **Schedule** (cron) to run every minute: `* * * * *`

## Step 4: Create API Key

1. Go to Appwrite Console > Overview > API Keys
2. Create a new API key with these scopes:
   - `documents.read`
   - `documents.write`
   - `functions.execute`
3. Copy the API key

## Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_PUSH_FUNCTION_ID=push-notifications-function-id
```

## Step 6: Deploy

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider.

## How It Works

1. **User enables push notifications** in Settings
2. **Browser subscribes** to push service with VAPID public key
3. **Subscription is sent** to Appwrite Function and stored in database
4. **Scheduler runs every minute** checking for due reminders
5. **When reminder is due**, the scheduler sends a push notification
6. **Service worker receives** the push and shows notification
7. **User taps notification** to open the app

## Testing

1. Build and deploy the app
2. Open the app and go to Settings
3. Enable "Push Notifications"
4. Enable a reminder for a time 1-2 minutes from now
5. Close the app/tab
6. Wait for the notification

## Troubleshooting

### Notifications not showing?
- Check browser notification permissions
- Check Appwrite Function logs
- Verify VAPID keys match
- Ensure Service Worker is registered

### Notifications not working when app is closed?
- Ensure the scheduler function is running (check Appwrite Console > Functions > Schedules)
- Check notification logs in Appwrite database

### Browser-specific issues?
- Chrome: Works fully
- Firefox: Works fully
- Safari: Requires macOS 13+ or iOS 16.1+
- Edge: Works fully