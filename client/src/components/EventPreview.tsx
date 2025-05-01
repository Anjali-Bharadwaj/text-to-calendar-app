import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData } from "@/types";
import { Calendar, MapPin, AlignLeft, Loader2, Calendar as CalendarIcon, AlertCircle, Download, Plus } from "lucide-react";
import { downloadICS, getGoogleCalendarUrl } from "@/lib/calendar";
import { format } from "date-fns";

interface EventPreviewProps {
  eventData: EventData | null;
  status: "idle" | "processing" | "success" | "error";
  errorMessage: string;
  onReset: () => void;
}

export default function EventPreview({ eventData, status, errorMessage, onReset }: EventPreviewProps) {
  // Processing State
  if (status === "processing") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Processing Your Event</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <div className="animate-pulse text-center">
            <Loader2 className="h-16 w-16 mx-auto text-primary-400 animate-spin" />
            <p className="mt-4 text-lg font-medium text-gray-700">Our AI is analyzing your text...</p>
            <p className="mt-2 text-sm text-gray-500">This usually takes a few seconds.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (status === "idle") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Event Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
          <CalendarIcon className="h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">No Event Yet</h3>
          <p className="mt-1 text-sm text-gray-500">Enter event details and click "Process with AI" to see the preview here.</p>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (status === "error") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage || "We couldn't process your event. Please check your input and try again."}</p>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={onReset}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success State with Event Data
  if (status === "success" && eventData) {
    const startDate = new Date(eventData.dateTime.start);
    const endDate = new Date(eventData.dateTime.end);
    
    const formattedDate = format(startDate, "EEEE, MMMM d, yyyy");
    const formattedStartTime = format(startDate, "h:mm a");
    const formattedEndTime = format(endDate, "h:mm a");
    const formattedTime = `${formattedStartTime} - ${formattedEndTime}`;

    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Event Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-6">
            {/* Calendar Preview */}
            <div className="calendar-preview rounded-lg border border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">{eventData.title}</span>
                </div>
                <span className="text-xs text-gray-500">Calendar Preview</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                    <p className="text-sm text-gray-500">{formattedTime}</p>
                  </div>
                </div>
                
                {eventData.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <p className="text-sm text-gray-900">{eventData.location}</p>
                  </div>
                )}
                
                {eventData.description && (
                  <div className="flex items-start">
                    <AlignLeft className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <p className="text-sm text-gray-900">{eventData.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Export Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Add to Your Calendar</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => downloadICS(eventData)}
                  className="inline-flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2 text-gray-400" />
                  Download .ics File
                </Button>
                
                <Button
                  variant="default"
                  onClick={() => window.open(getGoogleCalendarUrl(eventData), '_blank')}
                  className="inline-flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Google Calendar
                </Button>
              </div>
              
              <Button
                variant="link"
                size="sm"
                onClick={onReset}
                className="mt-2 text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                Create Another Event
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
