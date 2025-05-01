const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create .env file with necessary environment variables
const envContent = `ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=5000`;

// Create env file if it doesn't exist
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envContent);
  console.log('Created .env file - Please edit it to add your API keys');
}

// Create start-dev.bat file for Windows development
const startDevContent = `@echo off
set NODE_ENV=development
start cmd /k "npx vite ./client --config vite.config.local.js"
start cmd /k "node server.js"
`;

fs.writeFileSync('start-dev.bat', startDevContent);
console.log('Created start-dev.bat for Windows development');

// Create build-deploy.bat file for building and deployment
const buildDeployContent = `@echo off
echo Building the React application...
call npx vite build ./client --config vite.config.local.js
echo React build complete.
echo.
echo To run the deployed application:
echo 1. Set your ANTHROPIC_API_KEY in the .env file
echo 2. Run: node server.js
echo.
echo The application will be available at http://localhost:5000
`;

fs.writeFileSync('build-deploy.bat', buildDeployContent);
console.log('Created build-deploy.bat for production build');

// Create package.json scripts for Windows
try {
  // We don't modify package.json directly, but inform the user about manual steps
  console.log(`
========= MANUAL STEPS REQUIRED ==========
Since direct package.json editing isn't allowed, please add these scripts manually:

"scripts": {
  "dev:win": "node start-dev.js",
  "build:win": "vite build ./client --config vite.config.local.js",
  "start:win": "set NODE_ENV=production && node server.js"
}
=========================================
`);
} catch (error) {
  console.error('Error suggesting package.json modifications:', error.message);
}

// Instructions for the user
console.log(`
=== SETUP COMPLETE ===

To run the application on Windows:

1. Edit the .env file and add your Anthropic API key
2. Development: Run "start-dev.bat"
3. Production: 
   a. Run "build-deploy.bat" to build
   b. Run "node server.js" to start the server
   
The application will be available at:
- Development: http://localhost:5173 (client) and http://localhost:5000 (server)
- Production: http://localhost:5000
`);