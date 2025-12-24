
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null;

  constructor() {
    // Initialize GoogleGenAI with the API key from environment variables as per guidelines
    const apiKey = import.meta.env.GEMINI_API_KEY;
    try {
      if (!apiKey) {
        console.warn("Gemini API key missing. AI features are disabled. Set GEMINI_API_KEY in .env.local.");
        this.ai = null;
      } else {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error);
      this.ai = null;
    }
  }

  async analyzePRD(query: string, prdContent: string) {
    if (!this.ai) {
      return "AI is not configured. Please set GEMINI_API_KEY in .env.local and restart the dev server.";
    }
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following PRD of the SF Ecosystem:\n\n${prdContent}\n\nUser Question: ${query}`,
        config: {
          systemInstruction: "You are an expert Product Manager and Ecosystem Architect. Answer questions about the SF Ecosystem accurately based on the PRD. If the user asks for simulations (e.g., 'What happens if I double XP?'), provide a logical impact analysis.",
          temperature: 0.7
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini analysis error:", error);
      return "I'm having trouble analyzing that part of the ecosystem right now. Please check your connection.";
    }
  }

  async simulateVisibility(xp: number, reputation: number, recency: number = 1.0) {
    if (!this.ai) {
      return "AI is not configured. Please set GEMINI_API_KEY in .env.local and restart the dev server.";
    }
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Calculate visibility score for: XP=${xp}, Rep=${reputation}, Recency=${recency}. Formula: Score = XP * Recency * Reputation. Explain the result briefly.`,
      config: { temperature: 0.1 }
    });
    return response.text;
  }
}

export const gemini = new GeminiService();
