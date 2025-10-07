import { GoogleGenAI } from "@google/genai";

class AIService {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
    this.modelName = "gemini-2.5-flash-lite";
    this.systemInstruction = "You are a helpful AI assistant, your name is Assistant. Do not mention that you are trained by Google or built by Google.";
  }

  cleanHistoryForAI(history) {
    return history.map(entry => ({
      role: entry.role,
      // Use allParts if available (includes thought signatures for context), otherwise use parts
      parts: (entry.allParts || entry.parts).filter(part => 
        part.text || part.inlineData || part.thoughtSignature // Keep text, images, and thought signatures
      )
    })).filter(entry => entry.parts.length > 0); // Remove entries with no valid parts
  }

  extractThoughtsAndText(response) {
    // Extract thought summaries and regular text from response parts
    let thoughts = [];
    let text = '';
    let allParts = [];
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      const parts = response.candidates[0].content.parts || [];
      
      for (const part of parts) {
        // Preserve all parts for history (including thought signatures)
        allParts.push(part);
        
        if (part.text) {
          if (part.thought) {
            // This is a thought summary
            thoughts.push(part.text);
          } else {
            // This is regular response text
            text += part.text;
          }
        }
      }
    }
    
    return { thoughts, text, allParts };
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
      const result = await this.genAI.models.generateContent({
        model: "gemma-3-27b-it",
        contents: prompt
      });
      return result.text;
    } catch (error) {
      console.error("Error generating AI content:", error);
      return "Untitled Chat"; 
    }
  }

  async generateResponse(messageParts, history = [], forceSearch = false) {
    try {
      // Convert parts to the format expected by @google/genai
      const convertParts = (parts) => {
        return parts.map(part => {
          if (part.text) return { text: part.text };
          if (part.inlineData) return { inlineData: part.inlineData };
          return part;
        });
      };

      // Build contents array from history and new message
      const contents = [
        ...this.cleanHistoryForAI(history).map(entry => ({
          role: entry.role,
          parts: convertParts(entry.parts)
        })),
        {
          role: 'user',
          parts: convertParts(messageParts)
        }
      ];

      // If search is forced, use search model directly
      if (forceSearch) {
        console.log('🔍 [AI Service] Forcing search model');
        const searchResult = await this.genAI.models.generateContent({
          model: this.modelName,
          contents: contents,
          systemInstruction: this.systemInstruction,
          config: {
            thinkingConfig: {
              thinkingBudget: -1,
              includeThoughts: true
            },
            tools: [{ googleSearch: {} }]
          }
        });
        console.log('📥 [AI Service] Raw search response:', JSON.stringify(searchResult, null, 2));
        
        // Extract thoughts and text
        const { thoughts, text: responseText, allParts } = this.extractThoughtsAndText(searchResult);
        console.log('🧠 [AI Service] Extracted thoughts:', thoughts);
        
        // Process search response with citations
        let text = responseText;
        let citations = null;
        
        const supports = searchResult.candidates?.[0]?.groundingMetadata?.groundingSupports;
        const chunks = searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
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
        
        const forceSearchResponse = {
          success: true,
          text: text,
          citations: citations,
          usedSearch: true,
          functionCalls: null,
          thoughts: thoughts.length > 0 ? thoughts : null,
          allParts: allParts, // Include all parts for preserving thought signatures in history
          usageMetadata: {
            thoughtsTokenCount: searchResult.usageMetadata?.thoughtsTokenCount || 0,
            candidatesTokenCount: searchResult.usageMetadata?.candidatesTokenCount || 0,
            totalTokenCount: searchResult.usageMetadata?.totalTokenCount || 0
          }
        };
        console.log('✅ [AI Service] Returning forced search response:', forceSearchResponse);
        return forceSearchResponse;
      }

      // Start with the regular model that can call functions
      console.log('🤖 [AI Service] Calling regular model with function declarations');
      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: contents,
        systemInstruction: this.systemInstruction,
        config: { 
          thinkingConfig: {
            thinkingBudget: -1,
            includeThoughts: true
          },
          tools: [
          {
            functionDeclarations: [{
              name: "use_search_model",
              description: "Switch to the search-enabled model for queries that require real-time information, current events, or external data that isn't in your training knowledge.",
              parameters: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    description: "Brief explanation of why search is needed for this query"
                  }
                },
                required: ["reason"]
              }
            }]
          }
        ]
        },

      });
      console.log('📥 [AI Service] Raw regular model response:', JSON.stringify(result, null, 2));
      
      // Check if the model wants to use search
      const functionCalls = result.functionCalls;
      console.log('🔧 [AI Service] Function calls detected:', functionCalls);
      if (functionCalls && functionCalls.length > 0) {
        const searchCall = functionCalls.find(call => call.name === 'use_search_model');
        if (searchCall) {
          console.log('🔄 [AI Service] Switching to search model. Reason:', searchCall.args?.reason);
          // Switch to search model and regenerate response
          const searchResult = await this.genAI.models.generateContent({
            model: this.modelName,
            contents: contents,
            systemInstruction: this.systemInstruction,
       
            config: { 
              thinkingConfig: {
                thinkingBudget: -1,
                includeThoughts: true
              },
              tools: [{ googleSearch: {} }],
            } 
          });
          
          // Extract thoughts and text
          const { thoughts: searchThoughts, text: searchResponseText, allParts: searchAllParts } = this.extractThoughtsAndText(searchResult);
          console.log('🧠 [AI Service] Extracted thoughts from search:', searchThoughts);
          
          // Process search response with citations
          let text = searchResponseText;
          let citations = null;
          
          const supports = searchResult.candidates?.[0]?.groundingMetadata?.groundingSupports;
          const chunks = searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks;
          
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
          
          const searchResponse = {
            success: true,
            text: text,
            citations: citations,
            usedSearch: true,
            functionCalls: null,
            thoughts: searchThoughts.length > 0 ? searchThoughts : null,
            allParts: searchAllParts, // Include all parts for preserving thought signatures in history
            usageMetadata: {
              thoughtsTokenCount: searchResult.usageMetadata?.thoughtsTokenCount || 0,
              candidatesTokenCount: searchResult.usageMetadata?.candidatesTokenCount || 0,
              totalTokenCount: searchResult.usageMetadata?.totalTokenCount || 0
            }
          };
          console.log('✅ [AI Service] Returning search model response:', searchResponse);
          return searchResponse;
        }
      }
      
      // Extract thoughts and text from regular response
      const { thoughts: regularThoughts, text: regularResponseText, allParts: regularAllParts } = this.extractThoughtsAndText(result);
      console.log('🧠 [AI Service] Extracted thoughts from regular model:', regularThoughts);
      
      // Use the regular model response
      const regularResponse = {
        success: true,
        text: regularResponseText,
        citations: null,
        usedSearch: false,
        functionCalls: functionCalls,
        thoughts: regularThoughts.length > 0 ? regularThoughts : null,
        allParts: regularAllParts, // Include all parts for preserving thought signatures in history
        usageMetadata: {
          thoughtsTokenCount: result.usageMetadata?.thoughtsTokenCount || 0,
          candidatesTokenCount: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokenCount: result.usageMetadata?.totalTokenCount || 0
        }
      };
      console.log('✅ [AI Service] Returning regular model response:', regularResponse);
      return regularResponse;
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
