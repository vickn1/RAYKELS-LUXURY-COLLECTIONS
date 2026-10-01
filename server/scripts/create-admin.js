import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {
  createPasswordHash,
  getAdminCredentials,
  saveAdminCredentials
} from '../lib/admin-auth.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');

if (getAdminCredentials()) {
  console.error('Administrator account already exists.');
  console.error('No changes were made.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function askHidden(question) {
  process.stdout.write(question);

  return new Promise(resolve => {
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      rl.question('', answer => resolve(answer.trim()));
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();

    let value = '';

    const onData = chunk => {
      const char = chunk.toString();

      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(value);
        return;
      }

      if (char === '\u0003') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        process.exit(130);
      }

      if (char === '\u007f') {
        value = value.slice(0, -1);
        return;
      }

      if (char >= ' ') {
        value += char;
      }
    };

    stdin.on('data', onData);
  });
}

try {
  const username = await ask('Admin username: ');

  if (!username) {
    throw new Error('Username cannot be empty.');
  }

  const password = await askHidden('Admin password: ');

  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters.');
  }

  const confirmation = await askHidden('Confirm password: ');

  if (password !== confirmation) {
    throw new Error('Passwords do not match.');
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const credentials = {
    username,
    password: createPasswordHash(password),
    createdAt: new Date().toISOString()
  };

  saveAdminCredentials(credentials);

  try {
    fs.chmodSync(AUTH_FILE, 0o600);
  } catch {}

  console.log('Administrator account created successfully.');
  console.log(`Credential file: ${AUTH_FILE}`);
} catch (error) {
  console.error(`Setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
}
