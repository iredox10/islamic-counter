#!/bin/bash

# Appwrite Push Notifications Setup Script
# Run this after creating a project in Appwrite Console

echo "🚀 Appwrite Push Notifications Setup"
echo "====================================="
echo ""
echo "Before running this script, please:"
echo "1. Go to https://cloud.appwrite.io"
echo "2. Create a new project (or use existing)"
echo "3. Go to Overview > API Keys > Create API Key"
echo "4. Enable these scopes:"
echo "   - databases (all)"
echo "   - functions (all)"
echo "   - storage (all)"
echo "5. Copy the Project ID and API Key"
echo ""

read -p "Enter your Appwrite Project ID: " PROJECT_ID
read -p "Enter your Appwrite API Key: " API_KEY

ENDPOINT="https://cloud.appwrite.io/v1"

echo ""
echo "📦 Setting up Appwrite resources..."

# Create database
echo "Creating database..."
DB_RESPONSE=$(curl -s -X POST "$ENDPOINT/databases" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"databaseId": "tasbih", "name": "Tasbih"}')

if echo "$DB_RESPONSE" | grep -q '"$id"'; then
  echo "✅ Database created!"
else
  echo "Note: Database may already exist"
fi

# Create push_subscriptions collection
echo "Creating push_subscriptions collection..."
curl -s -X POST "$ENDPOINT/databases/tasbih/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{
    "collectionId": "push_subscriptions",
    "name": "Push Subscriptions",
    "permissions": ["read.any", "write.any"]
  }' > /dev/null 2>&1

# Add attributes
echo "Adding attributes..."
curl -s -X POST "$ENDPOINT/databases/tasbih/collections/push_subscriptions/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "userId", "size": 255, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/push_subscriptions/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "endpoint", "size": 2048, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/push_subscriptions/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "p256dh", "size": 255, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/push_subscriptions/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "auth", "size": 255, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/push_subscriptions/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "reminders", "size": 65535, "required": false}' > /dev/null 2>&1

echo "✅ push_subscriptions collection ready!"

# Create notification_logs collection
echo "Creating notification_logs collection..."
curl -s -X POST "$ENDPOINT/databases/tasbih/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{
    "collectionId": "notification_logs",
    "name": "Notification Logs",
    "permissions": ["read.any", "write.any"]
  }' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/notification_logs/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "userId", "size": 255, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/notification_logs/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "reminderId", "size": 255, "required": true}' > /dev/null 2>&1

curl -s -X POST "$ENDPOINT/databases/tasbih/collections/notification_logs/attributes/datetime" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"key": "sentAt", "required": true}' > /dev/null 2>&1

echo "✅ notification_logs collection ready!"

# Write .env file
echo ""
echo "Writing .env file..."
cat > .env << EOF
VITE_APPWRITE_ENDPOINT=$ENDPOINT
VITE_APPWRITE_PROJECT_ID=$PROJECT_ID
VITE_APPWRITE_API_KEY=$API_KEY
EOF

echo "✅ .env file created!"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy the push notification function:"
echo "   - Zip the appwrite-functions/push-notifications folder"
echo "   - Go to Appwrite Console > Functions > Create Function"
echo "   - Upload the zip file"
echo "   - Set runtime to Node.js"
echo ""
echo "2. Add environment variables to the function:"
echo "   VAPID_PUBLIC_KEY=REMOVED_VAPID_PUBLIC_KEY=="
echo "   VAPID_PRIVATE_KEY=REMOVED_VAPID_PRIVATE_KEY=="
echo "   APPWRITE_ENDPOINT=$ENDPOINT"
echo "   APPWRITE_PROJECT_ID=$PROJECT_ID"
echo "   APPWRITE_API_KEY=$API_KEY"
echo ""
echo "3. Create a schedule for the notification-scheduler function:"
echo "   Cron: * * * * * (every minute)"
echo ""
echo "4. Build and deploy:"
echo "   npm run build"
echo ""