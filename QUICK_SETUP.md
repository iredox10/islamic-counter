# Quick Setup Guide

## Option 1: Local Notifications (Works Now - No Backend)

The app already works with local notifications! Just:
1. Build and deploy the app
2. Enable notifications in Settings
3. Set reminder times
4. Keep the app tab open (or in background)

## Option 2: Full Push Notifications (Requires Appwrite Backend)

### Step 1: Create Appwrite Project
1. Go to https://cloud.appwrite.io/console
2. Click **"Create Project"**
3. Name it "Tasbih" 
4. Copy the **Project ID**

### Step 2: Create API Key
1. In your project, go to **Overview > API Keys**
2. Click **"Create API Key"**
3. Name: "Tasbih Server"
4. Select scopes:
   - `databases` (all)
   - `functions` (all)  
   - `storage` (all)
5. Click Create and **copy the API Key**

### Step 3: Run Setup Script
```bash
cd islamic-counter-pwa
chmod +x scripts/setup-appwrite.sh
./scripts/setup-appwrite.sh
# Enter your Project ID and API Key when prompted
```

### Step 4: Deploy Functions

**Push Notifications Function:**
1. Go to **Functions** in Appwrite Console
2. Click **"Create Function"**
3. Name: "push-notifications"
4. Runtime: **Node.js 18.0**
5. Upload `appwrite-functions/push-notifications/` as a zip
6. Add environment variables:
   ```
   VAPID_PUBLIC_KEY=REMOVED_VAPID_PUBLIC_KEY==
   VAPID_PRIVATE_KEY=REMOVED_VAPID_PRIVATE_KEY==
   ```

**Notification Scheduler Function:**
1. Create another function: "notification-scheduler"
2. Upload `appwrite-functions/notification-scheduler/`
3. Add the same environment variables
4. Add a **Schedule**: `* * * * *` (every minute)

### Step 5: Update & Deploy App
```bash
# Create .env file
echo "VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1" > .env
echo "VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID" >> .env

# Build and deploy
npm run build
# Upload dist/ folder to your hosting
```

### VAPID Keys (Keep Private!)
```
Public:  REMOVED_VAPID_PUBLIC_KEY==
Private: REMOVED_VAPID_PRIVATE_KEY==
```