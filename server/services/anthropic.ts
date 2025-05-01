import Anthropic from "@anthropic-ai/sdk";
import { EventData } from "../../client/src/types";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Function to extract event details from text using Claude
export async function extractEventDetails(
  anthropic: Anthropic, 
  text: string
): Promise<EventData> {
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
      model: MODEL,
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
      const eventData: EventData = {
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
