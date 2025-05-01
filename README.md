# Text to Calendar App

Convert natural language text into calendar events effortlessly using AI. This application allows you to describe your events in plain English and automatically creates calendar events with accurate details.

## 🌟 Features

- **Natural Language Processing**: Simply describe your event as you would to a friend
- **AI-Powered Event Extraction**: Automatically extracts date, time, location, and description
- **Multiple Export Options**:
  - Direct Google Calendar integration
  - Download as .ics file (compatible with Apple Calendar, Outlook, etc.)
- **Modern, User-Friendly Interface**: Clean and intuitive design
- **Real-Time Preview**: See how your event will appear before saving

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- Anthropic API key (for AI functionality)

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd text-to-calendar-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the setup script:
```bash
node setup-full.mjs
```

5. Start the application:
```bash
node server-anthropic.mjs
```

The application will be available at `http://localhost:5000`

## 💡 Usage Examples

Here are some examples of how you can describe your events:

- "Meet John for coffee tomorrow at 3pm at Starbucks"
- "Team meeting next Monday from 10am to 11:30am in the conference room"
- "Dentist appointment on May 15th at 2:30pm at Dr. Smith's office"
- "Weekly yoga class every Tuesday at 7am at Fitness Center"

## 🔧 Technical Details

### Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- AI: Anthropic Claude API
- Calendar Integration: Google Calendar API, iCalendar format

### Architecture
- RESTful API design
- Modular frontend components
- Secure API key handling
- Cross-platform calendar compatibility

## 📝 Notes

- The application uses local time for all event creation
- Google Calendar events open in a new tab for easy adding
- Downloaded .ics files are compatible with most calendar applications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Powered by Anthropic's Claude AI
- Calendar integration inspired by Google Calendar API
- UI design based on modern web standards
