import { Client, Databases, Functions, Storage, ID, Permission, Role } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAPID_PUBLIC_KEY = 'REMOVED_VAPID_PUBLIC_KEY==';
const VAPID_PRIVATE_KEY = 'REMOVED_VAPID_PRIVATE_KEY==';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('🚀 Appwrite Setup for Tasbih Push Notifications\n');
  console.log('Before running this script:');
  console.log('1. Go to https://cloud.appwrite.io');
  console.log('2. Create a new project called "Tasbih"');
  console.log('3. Go to Settings > API Keys > Create API Key');
  console.log('4. Select these scopes: databases, functions, storage (all read/write)');
  console.log('5. Copy the Project ID and API Key\n');
  
  const projectId = await question('Enter your Project ID: ');
  const apiKey = await question('Enter your API Key: ');
  const endpoint = 'https://cloud.appwrite.io/v1';
  
  rl.close();
  
  console.log('\n📦 Setting up...\n');
  
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  
  const databases = new Databases(client);
  const functions = new Functions(client);
  const storage = new Storage(client);
  
  // Create database
  let dbId;
  try {
    console.log('Creating database "tasbih"...');
    const db = await databases.create(ID.unique(), 'tasbih');
    dbId = db.$id;
    console.log('✅ Database created!');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('Database exists, listing...');
      const list = await databases.list();
      const found = list.databases.find(d => d.name === 'tasbih');
      if (found) {
        dbId = found.$id;
        console.log('✅ Using existing database');
      }
    } else {
      console.error('❌ Error:', e.message);
      process.exit(1);
    }
  }
  
  if (!dbId) {
    console.error('❌ Could not find or create database');
    process.exit(1);
  }
  
  // Create push_subscriptions collection
  let subsCollId;
  try {
    console.log('Creating push_subscriptions collection...');
    const coll = await databases.createCollection(dbId, ID.unique(), 'push_subscriptions', [
      Permission.read(Role.any()),
      Permission.write(Role.any())
    ]);
    subsCollId = coll.$id;
    console.log('✅ Collection created!');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      const list = await databases.listCollections(dbId);
      const found = list.collections.find(c => c.name === 'push_subscriptions');
      if (found) {
        subsCollId = found.$id;
        console.log('✅ Using existing collection');
      }
    } else {
      console.error('❌ Error:', e.message);
    }
  }
  
  if (subsCollId) {
    try {
      console.log('Adding attributes to push_subscriptions...');
      await databases.createStringAttribute(dbId, subsCollId, 'userId', 255, true);
      await databases.createStringAttribute(dbId, subsCollId, 'endpoint', 2048, true);
      await databases.createStringAttribute(dbId, subsCollId, 'p256dh', 255, true);
      await databases.createStringAttribute(dbId, subsCollId, 'auth', 255, true);
      await databases.createStringAttribute(dbId, subsCollId, 'reminders', 65535, false);
      console.log('✅ Attributes added!');
    } catch (e) {
      if (!e.message?.includes('already exists')) {
        console.error('Note:', e.message);
      }
    }
  }
  
  // Create notification_logs collection
  let logsCollId;
  try {
    console.log('Creating notification_logs collection...');
    const coll = await databases.createCollection(dbId, ID.unique(), 'notification_logs', [
      Permission.read(Role.any()),
      Permission.write(Role.any())
    ]);
    logsCollId = coll.$id;
    console.log('✅ Collection created!');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      const list = await databases.listCollections(dbId);
      const found = list.collections.find(c => c.name === 'notification_logs');
      if (found) {
        logsCollId = found.$id;
        console.log('✅ Using existing collection');
      }
    }
  }
  
  if (logsCollId) {
    try {
      console.log('Adding attributes to notification_logs...');
      await databases.createStringAttribute(dbId, logsCollId, 'userId', 255, true);
      await databases.createStringAttribute(dbId, logsCollId, 'reminderId', 255, true);
      await databases.createDatetimeAttribute(dbId, logsCollId, 'sentAt', true);
      console.log('✅ Attributes added!');
    } catch (e) {
      if (!e.message?.includes('already exists')) {
        console.error('Note:', e.message);
      }
    }
  }
  
  // Create storage bucket for function code
  try {
    console.log('Creating storage bucket for functions...');
    await storage.createBucket(ID.unique(), 'functions', [
      Permission.read(Role.any()),
      Permission.write(Role.any())
    ]);
    console.log('✅ Bucket created!');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('✅ Using existing bucket');
    }
  }
  
  // Write .env file
  const envContent = `VITE_APPWRITE_ENDPOINT=${endpoint}
VITE_APPWRITE_PROJECT_ID=${projectId}
VITE_APPWRITE_API_KEY=${apiKey}
`;
  
  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  console.log('\n✅ .env file created!');
  
  console.log('\n🎉 Setup Complete!\n');
  console.log('Database ID:', dbId);
  console.log('Subscriptions Collection ID:', subsCollId);
  console.log('Logs Collection ID:', logsCollId);
  console.log('\n📋 Next Steps:');
  console.log('1. Deploy the function:');
  console.log('   cd appwrite-functions/push-notifications');
  console.log('   appwrite deploy function');
  console.log('2. Set environment variables in Appwrite Console:');
  console.log('   VAPID_PUBLIC_KEY=' + VAPID_PUBLIC_KEY);
  console.log('   VAPID_PRIVATE_KEY=' + VAPID_PRIVATE_KEY);
  console.log('3. Create a schedule for the notification-scheduler function:');
  console.log('   Cron: * * * * * (every minute)');
  console.log('4. Run npm run build and deploy');
}

main().catch(console.error);