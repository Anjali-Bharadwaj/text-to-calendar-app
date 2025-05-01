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
  envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      env[parts[0].trim()] = parts[1].trim();
    }
  });
  console.log('Environment variables loaded from .env file');
}

console.log('Starting the server with Anthropic integration...');

// Check for Anthropic dependencies and API key
let anthropic = null;
let isAnthropicAvailable = false;

try {
  // Try to import the Anthropic SDK
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  
  // Check for API key
  const anthropicApiKey = env.ANTHROPIC_API_KEY;
  console.log('API Key found:', anthropicApiKey ? 'Yes' : 'No');
  
  if (anthropicApiKey) {
    anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
    isAnthropicAvailable = true;
    console.log('Successfully initialized Anthropic Claude API');
  } else {
    console.warn("Warning: ANTHROPIC_API_KEY not found in .env file");
    console.warn("Please edit the .env file and add your Anthropic API key");
  }
} catch (error) {
  console.warn("Anthropic SDK not available: " + error.message);
  console.warn("To install: npm install @anthropic-ai/sdk");
}

// Extract event details function
async function extractEventDetails(text) {
  if (!anthropic || !isAnthropicAvailable) {
    throw new Error("Anthropic API not available");
  }
  
  try {
    const systemPrompt = `
      You are a calendar event extraction assistant. 
      Extract structured event information from the user's text.
      
      Return a JSON object with the following fields:
      - title: Event title (string)
      - dateTime: Object containing 'start' and 'end' ISO date strings
      - location: Location of the event (string, or null if not provided)
      - description: Description or notes about the event (string, or null if not provided)
      
      Current date: ${new Date().toISOString().split('T')[0]}
      If a specific year is not mentioned, assume the current year.
      If no end time is specified, make the event 1 hour long.
      If time is ambiguous (e.g., "3 o'clock"), assume it's during business hours (9am-6pm).
      
      Return only the JSON with no additional text.
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      system: systemPrompt,
      max_tokens: 1024,
      messages: [
        { role: "user", content: text }
      ],
      temperature: 0.1,
    });

    // Parse the response to get event JSON
    const content = response.content[0].text;
    
    // Attempt to parse the JSON
    try {
      const parsedResponse = JSON.parse(content);
      
      // Validate the response has the required fields
      if (!parsedResponse.title || !parsedResponse.dateTime || 
          !parsedResponse.dateTime.start || !parsedResponse.dateTime.end) {
        throw new Error("Incomplete event data returned from AI");
      }
      
      // Create the event data with optional fields
      const eventData = {
        title: parsedResponse.title,
        dateTime: {
          start: parsedResponse.dateTime.start,
          end: parsedResponse.dateTime.end
        }
      };
      
      if (parsedResponse.location) {
        eventData.location = parsedResponse.location;
      }
      
      if (parsedResponse.description) {
        eventData.description = parsedResponse.description;
      }
      
      return eventData;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse event information from AI response");
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw new Error("Failed to process event with AI: " + (error instanceof Error ? error.message : String(error)));
  }
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

// API endpoint to process events
app.post("/api/process-event", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ 
        error: "Invalid input: Event text is required" 
      });
    }

    // Check if Anthropic is available
    if (!isAnthropicAvailable) {
      return res.status(400).json({ 
        error: "Anthropic API not configured. Please check server logs for details." 
      });
    }

    // Process text with Claude
    const eventData = await extractEventDetails(text);
    
    return res.status(200).json(eventData);
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

// Important: We bind to '0.0.0.0' to allow external connections
// This is critical for accepting connections from browsers on the same machine
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`You can also access it at http://127.0.0.1:${port}`);
  
  if (isAnthropicAvailable) {
    console.log('Anthropic Claude API is ready to process events');
  } else {
    console.log('Anthropic Claude API is NOT available');
    console.log('To enable AI processing:');
    console.log('1. Install the SDK: npm install @anthropic-ai/sdk');
    console.log('2. Add your API key to the .env file: ANTHROPIC_API_KEY=your_key_here');
  }
  
  console.log('To exit, press Ctrl+C');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});