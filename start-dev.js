const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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
  ['server.js'],
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