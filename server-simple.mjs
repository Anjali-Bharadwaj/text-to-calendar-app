
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envFile = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      env[parts[0].trim()] = parts[1].trim();
    }
  });
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add middleware to log API requests
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Check for Anthropic API key
const anthropicApiKey = env.ANTHROPIC_API_KEY;
  
if (!anthropicApiKey) {
  console.warn("Warning: ANTHROPIC_API_KEY not found in .env file");
  console.warn("Please edit the .env file and add your Anthropic API key");
}

// Mock endpoint for development without API key
app.post("/api/process-event", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ 
        error: "Invalid input: Event text is required" 
      });
    }

    // If no API key, return mock data for testing
    if (!anthropicApiKey) {
      console.log("No API key found, returning mock data");
      // Create tomorrow's date at 2 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      
      // End time is 1 hour later
      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0);
      
      return res.status(200).json({
        title: "Mock Event",
        dateTime: {
          start: tomorrow.toISOString(),
          end: endTime.toISOString()
        },
        description: "This is a mock event. Add your ANTHROPIC_API_KEY to .env for real processing."
      });
    }

    // If API key exists, you'll need to install the Anthropic SDK and implement real processing
    // For now, respond with an instructional message
    return res.status(501).json({
      error: "To process real events, install the Anthropic SDK with 'npm install @anthropic-ai/sdk'"
    });
  } catch (error) {
    console.error("Error processing event:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to process event text" 
    });
  }
});

// Serve client files (if they exist)
const clientDir = path.join(__dirname, 'dist');
if (fs.existsSync(clientDir)) {
  console.log('Serving static files from dist directory');
  app.use(express.static(clientDir));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Calendar Event Extractor</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            textarea { width: 100%; height: 150px; margin: 10px 0; padding: 10px; }
            button { padding: 10px 15px; background: #0066ff; color: white; border: none; cursor: pointer; }
            #result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; display: none; }
            pre { background: #f5f5f5; padding: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Calendar Event Extractor</h1>
          <p>Enter event details in natural language:</p>
          <textarea id="eventText" placeholder="Example: Meeting with John tomorrow at 2pm to discuss the project"></textarea>
          <button id="processBtn">Process with AI</button>
          <div id="result">
            <h2>Extracted Event:</h2>
            <pre id="eventData"></pre>
          </div>
          
          <script>
            document.getElementById('processBtn').addEventListener('click', async () => {
              const text = document.getElementById('eventText').value;
              if (!text.trim()) {
                alert('Please enter event details');
                return;
              }
              
              try {
                document.getElementById('processBtn').textContent = 'Processing...';
                document.getElementById('processBtn').disabled = true;
                
                const response = await fetch('/api/process-event', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  document.getElementById('eventData').textContent = JSON.stringify(data, null, 2);
                  document.getElementById('result').style.display = 'block';
                } else {
                  alert('Error: ' + (data.error || 'Failed to process event'));
                }
              } catch (error) {
                alert('Error: ' + error.message);
              } finally {
                document.getElementById('processBtn').textContent = 'Process with AI';
                document.getElementById('processBtn').disabled = false;
              }
            });
          </script>
        </body>
      </html>
    `);
  });
}

// Start server
const port = env.PORT || 5000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('To exit, press Ctrl+C');
});
