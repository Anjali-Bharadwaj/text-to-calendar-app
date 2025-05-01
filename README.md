# AI-Powered Text-to-Calendar Converter

This application converts natural language text descriptions into structured calendar events using Anthropic's Claude AI.

## Features

- Extract event details (title, date, time, location) from natural language
- Simple and intuitive user interface
- Compatible with Windows, macOS, and Linux
- No complex setup required

## Requirements

- Node.js (v14 or higher)
- Anthropic API key (optional for basic functionality)

## Setup Instructions for Windows

1. **Run the setup script**
   ```
   node setup-full.mjs
   ```
   This will create necessary files including `.env` and batch files.

2. **Configure your API key**
   - Edit the `.env` file
   - Replace `your_anthropic_api_key_here` with your actual Anthropic API key

3. **Choose how to run the application**

   For basic functionality without installing anything:
   ```
   start-app.bat
   ```
   OR
   ```
   node server-simple.mjs
   ```

   For full AI functionality (requires installing the SDK):
   ```
   npm install @anthropic-ai/sdk
   start-app-anthropic.bat
   ```
   OR
   ```
   npm install @anthropic-ai/sdk
   node server-anthropic.mjs
   ```

4. **Open in browser**
   - Go to http://localhost:5000

## Troubleshooting

If you encounter a "This site can't be reached" error:
1. Make sure the server is running
2. Try accessing the site using http://127.0.0.1:5000 instead of localhost
3. Check if port 5000 is already in use by another application

## API Reference

The application provides a simple API endpoint:

- `POST /api/process-event`
  - Request body: `{ "text": "your event description" }`
  - Response: JSON object with extracted event details

## License

MIT