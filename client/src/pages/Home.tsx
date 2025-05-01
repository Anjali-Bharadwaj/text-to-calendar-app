import Layout from "@/components/Layout";
import InputForm from "@/components/InputForm";
import EventPreview from "@/components/EventPreview";
import HowItWorks from "@/components/HowItWorks";
import { useState } from "react";
import { EventData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  const handleProcessSuccess = (data: EventData) => {
    setEventData(data);
    setStatus("success");
    toast({
      title: "Success!",
      description: "Event successfully processed!",
    });
  };

  const handleProcessError = (error: string) => {
    setErrorMessage(error);
    setStatus("error");
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  };

  const resetState = () => {
    setEventData(null);
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Convert Text to Calendar Events</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Describe your event in natural language and our AI will create a calendar event for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <InputForm 
            onProcessingStart={() => setStatus("processing")} 
            onProcessSuccess={handleProcessSuccess}
            onProcessError={handleProcessError}
          />
          <EventPreview 
            eventData={eventData} 
            status={status} 
            errorMessage={errorMessage}
            onReset={resetState}
          />
        </div>

        <HowItWorks />
      </div>
    </Layout>
  );
}
