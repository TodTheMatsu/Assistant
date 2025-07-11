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
      tools: [{ functionDeclarations: [this.getFlowchartFunction()] }]
    });
    
    this.searchModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }]
    });
  }

  getFlowchartFunction() {
    return {
      name: "createFlowchart",
      description: "Creates or modifies a flowchart diagram from the provided nodes and connections. Use this when the user asks for a flowchart, process diagram, workflow, visual representation of steps, or wants to modify an existing flowchart. If there's an existing flowchart context provided, modify it according to the user's request.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the flowchart"
          },
          description: {
            type: "string",
            description: "Brief description of what the flowchart represents"
          },
          nodes: {
            type: "array",
            description: "Array of nodes in the flowchart",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Unique identifier for the node" },
                type: { 
                  type: "string", 
                  enum: ["start", "end", "process", "decision", "data"],
                  description: "Type of node: start (green oval), end (red oval), process (blue rectangle), decision (yellow diamond), data (orange parallelogram)"
                },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number", description: "X coordinate" },
                    y: { type: "number", description: "Y coordinate" }
                  }
                },
                data: {
                  type: "object",
                  properties: {
                    label: { type: "string", description: "Text label for the node" }
                  }
                }
              },
              required: ["id", "type", "position", "data"]
            }
          },
          edges: {
            type: "array",
            description: "Array of connections between nodes",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Unique identifier for the edge" },
                source: { type: "string", description: "ID of source node" },
                target: { type: "string", description: "ID of target node" },
                label: { type: "string", description: "Optional label for the edge" },
                animated: { type: "boolean", description: "Whether edge should be animated" }
              },
              required: ["id", "source", "target"]
            }
          }
        },
        required: ["title", "nodes", "edges"]
      }
    };
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

  async generateResponse(messageParts, useSearch = false, currentFlowChart = null, history = []) {
    try {
      // Prepare the message parts with flowchart context if needed
      const processedParts = [...messageParts];
      
      // Always include flowchart context if available (only when not in search mode)
      if (currentFlowChart && !useSearch) {
        processedParts.push({
          text: `\n\n[Current FlowChart Context]\nTitle: ${currentFlowChart.title}\nDescription: ${currentFlowChart.description}\nNodes: ${JSON.stringify(currentFlowChart.nodes)}\nEdges: ${JSON.stringify(currentFlowChart.edges)}\n\nYou can modify this existing flowchart if the user's request relates to it.`
        });
      }

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
