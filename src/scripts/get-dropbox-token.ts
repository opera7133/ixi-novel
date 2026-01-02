import { Dropbox, DropboxAuth } from 'dropbox';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || 'http://localhost:8080/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: DROPBOX_CLIENT_ID and DROPBOX_CLIENT_SECRET must be defined in .env file');
  process.exit(1);
}

// Create a simple HTTP server to handle the OAuth callback
function createCallbackServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        if (!req.url) {
          res.writeHead(400);
          res.end('Invalid request');
          return;
        }

        const { searchParams } = new URL(req.url, REDIRECT_URI);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          res.writeHead(400);
          res.end(`Error: ${error}`);
          reject(new Error(`Dropbox authorization error: ${error}`));
          return;
        }

        if (!code) {
          res.writeHead(400);
          res.end('No authorization code received');
          reject(new Error('No authorization code received'));
          return;
        }

        res.writeHead(200);
        res.end('Authorization successful! You can close this window.');
        resolve(code);
      } catch (err) {
        res.writeHead(500);
        res.end('Internal error');
        reject(err);
      }
    });

    server.listen(8080, () => {
      console.log('Callback server listening on http://localhost:8080');
    });

    // Close server after 30 seconds of inactivity or when callback is received
    setTimeout(() => {
      server.close();
    }, 30000);
  }).finally(() => {
    // Ensure server is closed
  });
}

async function getRefreshToken() {
  try {
    console.log('Starting Dropbox OAuth flow...\n');

    // Step 1: Generate authorization URL
    const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const authUrl = await dbxAuth.getAuthenticationUrl(REDIRECT_URI, '', 'code', 'offline');

    console.log('Please visit this URL to authorize the application:');
    console.log(authUrl);
    console.log('\nWaiting for authorization...\n');

    // Step 2: Start callback server and wait for authorization code
    const authCode = await createCallbackServer();
    console.log('Authorization code received!');

    // Step 3: Exchange authorization code for tokens
    const tokenResponse = await dbxAuth.getAccessTokenFromCode(REDIRECT_URI, authCode);

    const accessToken = tokenResponse.result.access_token;
    const refreshToken = tokenResponse.result.refresh_token;
    const expiresIn = tokenResponse.result.expires_in;

    console.log('\n✓ Token acquisition successful!');
    console.log(`\nAccess Token: ${accessToken}`);
    console.log(`Refresh Token: ${refreshToken}`);
    console.log(`Expires in: ${expiresIn} seconds`);

    // Step 4: Optionally save to .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Update or add tokens
    const updateEnv = (content: string, key: string, value: string): string => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
      }
      return content ? `${content}\n${key}=${value}` : `${key}=${value}`;
    };

    envContent = updateEnv(envContent, 'DROPBOX_ACCESS_TOKEN', accessToken);
    envContent = updateEnv(envContent, 'DROPBOX_REFRESH_TOKEN', refreshToken);

    fs.writeFileSync(envPath, envContent);
    console.log(`\n✓ Tokens saved to .env file`);
    process.exit(0);
  } catch (error: any) {
    console.error('Error getting refresh token:', error.message);
    if (error.error) {
      console.error('Dropbox API Error:', JSON.stringify(error.error, null, 2));
    }
    process.exit(1);
  }
}

getRefreshToken();
