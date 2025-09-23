import { GoogleGenerativeAI } from "@google/generative-ai";

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
    this.initializeModels();
  }

  initializeModels() {
    // Create separate models for different use cases
    this.regularModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a helpful AI assistant, your name is Assistant. Do not mention that you are trained by Google or built by Google."
    });
    
    this.searchModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a helpful AI assistant with access to search tools, your name is Assistant. Do not mention that you are trained by Google or built by Google."
    });
  }

  cleanHistoryForAI(history) {
    return history.map(entry => ({
      role: entry.role,
      parts: entry.parts.filter(part => 
        part.text || part.inlineData // Keep text and images, exclude flowchart data
      )
    })).filter(entry => entry.parts.length > 0); // Remove entries with no valid parts
  }

  async generateTitle(history) {
    try {
      const textOnlyHistory = history.filter(entry => entry.role === 'user' || entry.role === 'model')
        .map(entry => ({
          role: entry.role,
          parts: entry.parts.filter(part => part.text).map(part => ({ text: part.text }))
        }))
        .filter(entry => entry.parts.length > 0);

      const prompt = "Generate a short title for the following chat history, you will only give one title and nothing else: " + JSON.stringify(textOnlyHistory);
      const result = await this.regularModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error generating AI content:", error);
      return "Untitled Chat"; 
    }
  }

  async generateResponse(messageParts, useSearch = false, history = []) {
    try {
      // Prepare the message parts
      const processedParts = [...messageParts];

      // Choose model based on search mode
      const selectedModel = useSearch ? this.searchModel : this.regularModel;

      const chat = selectedModel.startChat({ 
        history: this.cleanHistoryForAI(history) 
      });

      const result = await chat.sendMessage(processedParts);
      
      return {
        success: true,
        result: result,
        functionCalls: result.response.functionCalls ? result.response.functionCalls() : null
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AIService;
