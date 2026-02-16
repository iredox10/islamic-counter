const fs = require('fs');
const path = require('path');
const https = require('https');

// Load Appwrite prefs
const prefsPath = path.join(process.env.HOME, '.appwrite', 'prefs.json');
const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));

// Find the config with console session
let sessionCookie = null;
for (const [id, config] of Object.entries(prefs)) {
  if (config.cookie) {
    sessionCookie = config.cookie;
    break;
  }
}

if (!sessionCookie) {
  console.error('No session found');
  process.exit(1);
}

// Extract the session value
const match = sessionCookie.match(/a_session_console=([^;]+)/);
const sessionValue = match ? match[1] : null;

if (!sessionValue) {
  console.error('Could not extract session');
  process.exit(1);
}

console.log('Found session, attempting to create project...');

const data = JSON.stringify({
  projectId: 'tasbih',
  name: 'Tasbih Push Notifications'
});

const options = {
  hostname: 'cloud.appwrite.io',
  port: 443,
  path: '/v1/projects',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Cookie': `a_session_console=${sessionValue}`
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
    const result = JSON.parse(body);
    if (result.$id) {
      console.log('\n✅ Project created!');
      console.log('Project ID:', result.$id);
      
      // Write .env
      const envContent = `VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=${result.$id}
`;
      fs.writeFileSync('.env', envContent);
      console.log('.env file created');
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();