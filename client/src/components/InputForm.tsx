import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Loader } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { EventData } from "@/types";

interface InputFormProps {
  onProcessingStart: () => void;
  onProcessSuccess: (data: EventData) => void;
  onProcessError: (error: string) => void;
}

export default function InputForm({ onProcessingStart, onProcessSuccess, onProcessError }: InputFormProps) {
  const [eventText, setEventText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventText.trim()) {
      onProcessError("Please enter event details.");
      return;
    }
    
    try {
      setIsProcessing(true);
      onProcessingStart();
      
      const response = await apiRequest("POST", "/api/process-event", { text: eventText });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      onProcessSuccess(data);
    } catch (error) {
      onProcessError(error instanceof Error ? error.message : "Failed to process event.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle>Describe Your Event</CardTitle>
        <p className="mt-1 text-sm text-gray-500">
          Enter details about your event in natural language.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-text" className="block text-sm font-medium text-gray-700">Event Description</Label>
              <div className="mt-1">
                <Textarea 
                  id="event-text" 
                  rows={6} 
                  className="resize-none"
                  placeholder="Example: Meeting with John next Monday at 2 PM to discuss the project proposal."
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Try to include time, date, title, and location if applicable.
              </p>
            </div>

            {isProcessing ? (
              <Button 
                type="button" 
                className="w-full bg-gray-400 cursor-not-allowed"
                disabled
              >
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full"
              >
                <Play className="h-5 w-5 mr-2" />
                Process with AI
              </Button>
            )}

            <div className="pt-2">
              <details className="text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-primary-600 font-medium">Examples & Tips</summary>
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-700">Sample Inputs:</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>"Dentist appointment next Tuesday at 3:30 PM at Dr. Smith's office"</li>
                    <li>"Weekly team meeting every Friday from 10-11 AM in the conference room"</li>
                    <li>"Lunch with Sarah tomorrow at noon at the Italian restaurant"</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
