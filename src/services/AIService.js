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

  addCitations(response) {
    let text = response.text();
    const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
    const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;

    if (!supports || !chunks) return text;

    // Sort supports by end_index in descending order to avoid shifting issues when inserting.
    const sortedSupports = [...supports].sort(
      (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
    );

    for (const support of sortedSupports) {
      const endIndex = support.segment?.endIndex;
      if (endIndex === undefined || !support.groundingChunkIndices?.length) {
        continue;
      }

      const citationLinks = support.groundingChunkIndices
        .map(i => {
          const uri = chunks[i]?.web?.uri;
          const title = chunks[i]?.web?.title;
          if (uri) {
            const domain = title && title.includes('.') ? title : new URL(uri).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
            return `![${domain}](${faviconUrl}) [${i + 1}](${uri})`;
          }
          return null;
        })
        .filter(Boolean);

      if (citationLinks.length > 0) {
        const citationString = citationLinks.join(", ");
        text = text.slice(0, endIndex) + " " + citationString + text.slice(endIndex);
      }
    }

    return text;
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
      
      // Get the response text and process citations
      let text = result.response.text();
      let citations = null;
      
      if (useSearch) {
        const supports = result.response.candidates[0]?.groundingMetadata?.groundingSupports;
        const chunks = result.response.candidates[0]?.groundingMetadata?.groundingChunks;
        
        if (supports && chunks) {
          // Sort supports by end_index in descending order to avoid shifting issues
          const sortedSupports = [...supports].sort(
            (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0)
          );
          
          citations = [];
          let citationCounter = 1;
          
          for (const support of sortedSupports) {
            const endIndex = support.segment?.endIndex;
            if (endIndex === undefined || !support.groundingChunkIndices?.length) {
              continue;
            }
            
            const sources = support.groundingChunkIndices
              .map(i => ({
                title: chunks[i]?.web?.title,
                uri: chunks[i]?.web?.uri,
                faviconUrl: chunks[i]?.web?.title ? `https://www.google.com/s2/favicons?domain=${chunks[i].web.title}&sz=16` : null
              }))
              .filter(source => source.uri);
            
            if (sources.length > 0) {
              // Insert citation marker in text
              const citationMarker = `<cite>${citationCounter}</cite>`;
              text = text.slice(0, endIndex) + citationMarker + text.slice(endIndex);
              
              citations.push({
                id: citationCounter,
                sources: sources
              });
              
              citationCounter++;
            }
          }
        }
      }
      
      return {
        success: true,
        text: text,
        citations: citations,
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
