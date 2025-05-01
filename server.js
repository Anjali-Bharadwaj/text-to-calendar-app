// Import required modules
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`[express] ${logLine}`);
    }
  });

  next();
});

// Check for Anthropic API key
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
if (!anthropicApiKey) {
  console.warn("Warning: ANTHROPIC_API_KEY not found in environment variables");
}

const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

// Extract event details function
async function extractEventDetails(anthropic, text) {
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

// Define process-event endpoint
app.post("/api/process-event", async (req, res) => {
  try {
    // Basic validation
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ 
        error: "Invalid input: Event text is required" 
      });
    }

    // Process text with Claude
    if (!anthropicApiKey) {
      return res.status(500).json({
        error: "API key for Anthropic Claude not configured"
      });
    }

    const eventData = await extractEventDetails(anthropic, text);
    
    return res.status(200).json(eventData);
  } catch (error) {
    console.error("Error processing event:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to process event text" 
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Create and start server
const port = process.env.PORT || 5000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});