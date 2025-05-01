import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting development servers...');

// Start the Vite client server
const client = spawn(
  'npx',
  ['vite', './client', '--config', 'vite.config.local.js'],
  { 
    stdio: 'inherit',
    shell: true
  }
);

console.log('Client server starting...');

// Start the API server
const server = spawn(
  'node',
  ['server.mjs'],
  { 
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  }
);

console.log('API server starting...');

// Handle process termination
process.on('SIGINT', () => {
  client.kill();
  server.kill();
  process.exit();
});