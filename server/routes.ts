import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { extractEventDetails } from "./services/anthropic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check for Anthropic API key
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || import.meta.env?.VITE_ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.warn("Warning: ANTHROPIC_API_KEY not found in environment variables");
  }

  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });

  // Define process-event endpoint
  app.post("/api/process-event", async (req, res) => {
    try {
      // Validate request body
      const schema = z.object({
        text: z.string().min(1, "Event text is required"),
      });

      const validation = schema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid input: " + validation.error.errors[0]?.message 
        });
      }

      const { text } = validation.data;

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

  const httpServer = createServer(app);
  return httpServer;
}
