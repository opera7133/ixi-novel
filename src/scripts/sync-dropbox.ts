import { Dropbox } from 'dropbox';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
const DROPBOX_FOLDER_PATH = process.env.DROPBOX_FOLDER_PATH || '/novels';
const LOCAL_CONTENT_PATH = path.join(process.cwd(), 'src/content/novels');

if (!REFRESH_TOKEN && !ACCESS_TOKEN) {
  console.error('Error: DROPBOX_REFRESH_TOKEN or DROPBOX_ACCESS_TOKEN must be defined in .env file');
  process.exit(1);
}

if (REFRESH_TOKEN && !CLIENT_ID) {
  console.error('Error: DROPBOX_CLIENT_ID must be defined when using DROPBOX_REFRESH_TOKEN');
  process.exit(1);
}

// Initialize Dropbox client
let dbx: Dropbox;
if (REFRESH_TOKEN && CLIENT_ID && CLIENT_SECRET) {
  dbx = new Dropbox({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, refreshToken: REFRESH_TOKEN });
} else if (ACCESS_TOKEN) {
  dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
} else {
  console.error('Error: Unable to initialize Dropbox client');
  process.exit(1);
}

async function syncNovels() {
  try {
    console.log(`Syncing from Dropbox folder: ${DROPBOX_FOLDER_PATH}`);

    // Ensure local directory exists
    if (!fs.existsSync(LOCAL_CONTENT_PATH)) {
      fs.mkdirSync(LOCAL_CONTENT_PATH, { recursive: true });
    }

    // List files in the Dropbox folder
    const response = await dbx.filesListFolder({ path: DROPBOX_FOLDER_PATH });

    for (const entry of response.result.entries) {
      const ignoreList = ['INSTRUCTION.md', 'README.md', 'template.md'];
      if (entry['.tag'] === 'file' && entry.name.endsWith('.md') && !ignoreList.includes(entry.name)) {
        console.log(`Downloading: ${entry.name}`);

        const fileData = await dbx.filesDownload({ path: entry.path_lower! });

        // The file data is in (fileData.result as any).fileBinary
        // However, the SDK types might not expose it directly depending on version,
        // but usually it's returned as a blob or buffer in the result.
        // In Node.js environment with this SDK, the result usually contains the file data.

        const buffer = (fileData.result as any).fileBinary;

        if (buffer) {
          const localFilePath = path.join(LOCAL_CONTENT_PATH, entry.name);

          // Remove instruction text
          let content = buffer.toString('utf-8');
          content = content.replace(/INSTRUCTION\.mdに沿って執筆してください。/g, '');

          fs.writeFileSync(localFilePath, content);
          console.log(`Saved to: ${localFilePath}`);
        } else {
            console.warn(`Warning: No data found for ${entry.name}`);
        }
      }
    }

    console.log('Sync completed successfully.');

  } catch (error: any) {
    console.error('Error syncing files:', error);
    if (error.error) {
        console.error('Dropbox API Error:', JSON.stringify(error.error, null, 2));
    }
  }
}

syncNovels();
