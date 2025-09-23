import { useState, useRef, useEffect, useCallback } from "react";

// Import new components
import Sidebar from "./components/ui/Sidebar.jsx";
import WelcomeScreen from "./components/ui/WelcomeScreen.jsx";
import ChatInterface from "./components/chat/ChatInterface.jsx";
import InputArea from "./components/ui/InputArea.jsx";

// Import hooks and utilities
import { useFileUpload } from "./hooks/useFileUpload.js";
import { useChatHistory } from "./hooks/useChatHistory.js";
import { getFileIcon } from "./utils/fileUtils.js";
import AIService from "./services/AIService.js";

function AppContent() {
  // Use custom hooks
  const {
    selectedFiles,
    handleFileSelect,
    handlePaste,
    removeFile,
    clearFiles,
    processFilesForAI
  } = useFileUpload();

  const {
    history,
    previousChats,
    onExistingChat,
    currentChatIndex,
    loading,
    setLoading,
    updateHistory,
    createChat,
    loadChat,
    deleteChat,
    saveChatHistory
  } = useChatHistory();

  // Local state
  const [inputText, setInput] = useState(""); 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState(null); // null = no mode, 'search' = search mode
  const [retryAttempt, setRetryAttempt] = useState(0); // Track retry attempts
  
  // Refs
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  
  // Initialize AI Service
  const aiService = new AIService();
  
  // Helper functions to check current mode
  const useSearch = activeMode === 'search';
  
  // Function to handle mode toggling
  const toggleMode = (mode) => {
    if (activeMode === mode) {
      // If clicking the same mode, turn it off
      setActiveMode(null);
    } else {
      // Otherwise, switch to the new mode
      setActiveMode(mode);
    }
  };

  // Enhanced chat functions that also handle flowchart context
  const handleCreateChat = useCallback(async () => {
    await createChat();
  }, [createChat]);

  const handleLoadChat = useCallback((chat, index) => {
    loadChat(chat, index);
  }, [loadChat]);

  const handleDeleteChat = useCallback((indexToDelete, e) => {
    deleteChat(indexToDelete, e);
  }, [deleteChat]);

  // Helper function to detect if a function call should have been made
  const shouldHaveCalledFunction = (userMessage, aiResponse) => {
    const userText = userMessage.parts.map(part => part.text).join(' ').toLowerCase();
    const aiText = aiResponse.toLowerCase();
    
    // Check for flowchart-related keywords in user message
    const flowchartKeywords = [
      'flowchart', 'flow chart', 'diagram', 'process', 'workflow', 'chart',
      'visualize', 'visual', 'show me', 'create', 'draw', 'steps',
      'process flow', 'decision tree', 'algorithm', 'procedure'
    ];
    
    const hasFlowchartKeywords = flowchartKeywords.some(keyword => 
      userText.includes(keyword)
    );
    
    // Check if AI response mentions creating/making something visual but no function was called
    const aiMentionsCreation = aiText.includes('create') || aiText.includes('make') || 
                              aiText.includes('generate') || aiText.includes('show') ||
                              aiText.includes('diagram') || aiText.includes('flowchart');
    
    return hasFlowchartKeywords && aiMentionsCreation;
  };

  // Enhanced AI request with retry logic
  const callAIWithRetry = async (messageParts, useSearch, currentFlowChart, history, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      // Update retry attempt state for UI feedback
      setRetryAttempt(retryCount);
      
      // Add retry context to message if this is a retry
      let enhancedParts = [...messageParts];
      if (retryCount > 0) {
        enhancedParts.push({
          text: `\n\n[IMPORTANT: This is a retry. The user's request seems to need a function call (like creating a flowchart). Please use the available functions if appropriate. Don't just describe what you would do - actually call the function.]`
        });
      }
      
      const response = await aiService.generateResponse(
        enhancedParts,
        useSearch,
        history
      );
      
      if (response.success) {
        // Check if we should have called a function but didn't
        if (!response.functionCalls || response.functionCalls.length === 0) {
          const userMessage = { parts: messageParts };
          const aiResponseText = response.result.response.text();
          
          if (shouldHaveCalledFunction(userMessage, aiResponseText) && retryCount < maxRetries) {
            console.log(`Retrying AI request (attempt ${retryCount + 1}/${maxRetries + 1}) - function call expected but not made`);
            return await callAIWithRetry(messageParts, useSearch, currentFlowChart, history, retryCount + 1);
          }
        }
      }
      
      // Reset retry attempt when successful
      setRetryAttempt(0);
      return response;
    } catch (error) {
      if (retryCount < maxRetries) {
        console.log(`Retrying AI request (attempt ${retryCount + 1}/${maxRetries + 1}) - error occurred:`, error.message);
        return await callAIWithRetry(messageParts, useSearch, currentFlowChart, history, retryCount + 1);
      }
      // Reset retry attempt on final failure
      setRetryAttempt(0);
      throw error;
    }
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    
    // Don't start a new request if already loading
    if (loading) return;
    
    // Store inputs immediately to avoid timing issues with state updates
    const requestInput = inputText;
    const requestFiles = [...selectedFiles];
    
    // Don't send if there's no content (no text and no files)
    if (!requestInput.trim() && requestFiles.length === 0) return;
    
    setLoading(true);
    
    try {
      // Prepare user message parts
      const messageParts = [];
      
      // Only add text part if there's actual text content
      if (requestInput.trim()) {
        messageParts.push({ text: requestInput });
      }
      
      // Process files and add to message parts
      const fileParts = await processFilesForAI();
      messageParts.push(...fileParts);
      
      // Create user message for history
      const userMessage = { 
        role: "user", 
        parts: messageParts.map(part => {
          if (part.inlineData) {
            return { 
              inlineData: part.inlineData,
              fileInfo: { 
                name: requestFiles.find(f => f.type === 'image')?.name || 'image',
                type: part.inlineData.mimeType,
                size: requestFiles.find(f => f.type === 'image')?.size || 0
              }
            };
          }
          return part;
        })
      };
      
      // Add user message to history immediately for display
      const historyWithUserMessage = [...history, userMessage];
      updateHistory(historyWithUserMessage);
      
      // Clear input and files
      setInput("");
      clearFiles();
      
      // Generate AI response with retry logic
      const response = await callAIWithRetry(
        messageParts,
        useSearch,
        null,
        history
      );
      
      if (response.success) {
        let aiMessage;
        
        // Handle function calls (for flowcharts)
        if (response.functionCalls && response.functionCalls.length > 0) {
          // Handle other function calls if any
          aiMessage = { role: "model", parts: [{ text: "Function call completed." }] };
        } else {
          // Regular text response
          aiMessage = { role: "model", parts: [{ text: response.result.response.text() }] };
        }
        
        // Add AI response to history and save
        const finalHistory = [...historyWithUserMessage, aiMessage];
        updateHistory(finalHistory);
        await saveChatHistory(finalHistory);
        
      } else {
        console.error("AI response error:", response.error);
        // Add error message to history
        const errorMessage = { 
          role: "model", 
          parts: [{ text: "I'm sorry, I encountered an error processing your request. Please try again." }] 
        };
        const finalHistory = [...historyWithUserMessage, errorMessage];
        updateHistory(finalHistory);
        await saveChatHistory(finalHistory);
      }
      
    } catch (error) {
      console.error("Error in fetchAIResponse:", error);
      // Add error message to history
      const errorMessage = { 
        role: "model", 
        parts: [{ text: "I'm sorry, I encountered an error processing your request. Please try again." }] 
      };
      const finalHistory = [...history, errorMessage];
      updateHistory(finalHistory);
      await saveChatHistory(finalHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-row justify-center items-end">
        {/* Sidebar Component */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          previousChats={previousChats}
          currentChatIndex={currentChatIndex}
          createChat={handleCreateChat}
          loadChat={handleLoadChat}
          deleteChat={handleDeleteChat}
        />

        {/* Main Content - adjusts width when editor is open */}
        <div className={`h-full flex flex-col justify-start items-center w-full`}>
          {history.length === 0 && !loading ? (
            <WelcomeScreen
              inputText={inputText}
              handleChange={handleChange}
              handlePaste={handlePaste}
              fetchAIResponse={fetchAIResponse}
              loading={loading}
              retryAttempt={retryAttempt}
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
              getFileIcon={getFileIcon}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              toggleMode={toggleMode}
              useSearch={useSearch}
              inputRef={inputRef}
              fileInputRef={fileInputRef}
              dropdownRef={dropdownRef}
            />
          ) : (
            <ChatInterface
              history={history}
              loading={loading}
              resultsRef={resultsRef}
              useSearch={useSearch}
            />
          )}

          {/* Input Area - shown only when there are messages */}
          {history.length > 0 && (
            <InputArea
              inputText={inputText}
              handleChange={handleChange}
              handlePaste={handlePaste}
              fetchAIResponse={fetchAIResponse}
              loading={loading}
              retryAttempt={retryAttempt}
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
              getFileIcon={getFileIcon}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              toggleMode={toggleMode}
              useSearch={useSearch}
              inputRef={inputRef}
              fileInputRef={fileInputRef}
              dropdownRef2={dropdownRef2}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
