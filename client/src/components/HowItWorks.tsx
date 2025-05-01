import { Edit, Sparkles, Calendar } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Edit className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">1. Describe Your Event</h3>
          <p className="text-gray-600">Enter your event details in natural language, the way you would describe it to a friend.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">2. AI Processes Your Text</h3>
          <p className="text-gray-600">Our AI analyzes your text to extract date, time, title, location, and other important details.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">3. Add to Your Calendar</h3>
          <p className="text-gray-600">Download the event as an .ics file or add it directly to your Google Calendar with one click.</p>
        </div>
      </div>
    </div>
  );
}
