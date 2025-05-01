import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy client/index.html to dist/index.html
const sourceFile = path.join(__dirname, 'client', 'index.html');
const destFile = path.join(distDir, 'index.html');

fs.copyFileSync(sourceFile, destFile);
console.log('Build complete! Files copied to dist/ directory.'); 