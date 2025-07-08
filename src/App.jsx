import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Text from "./Text.jsx";
import { FlowChartProvider, useFlowChart } from "./FlowChartContext.jsx";
import FlowChartEditor from "./components/FlowChartEditor.jsx";

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
  const { handleAIModification, getFlowChartForAI, openEditor, isEditorOpen, setCurrentChat } = useFlowChart();
  
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
    addToHistory,
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
    // Set up new chat in flowchart context
    const newChatId = `chat_${Date.now()}`;
    setCurrentChat(newChatId);
  }, [createChat, setCurrentChat]);

  const handleLoadChat = useCallback((chat, index) => {
    loadChat(chat, index);
    // Set up existing chat in flowchart context
    const chatId = `chat_${index}`;
    setCurrentChat(chatId);
  }, [loadChat, setCurrentChat]);

  const handleDeleteChat = useCallback((indexToDelete, e) => {
    deleteChat(indexToDelete, e);
    // Note: FlowChart context automatically handles cleanup when switching chats
  }, [deleteChat]);

  // Initialize flowchart context with initial chat
  useEffect(() => {
    if (currentChatIndex === -1 && !onExistingChat) {
      // This is a new chat session
      const initialChatId = `chat_${Date.now()}`;
      setCurrentChat(initialChatId);
    } else if (currentChatIndex >= 0) {
      // We're on an existing chat
      const chatId = `chat_${currentChatIndex}`;
      setCurrentChat(chatId);
    }
  }, [currentChatIndex, onExistingChat, setCurrentChat]);

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
      
      // Get current flowchart for context (always pass it to AI)
      const currentFlowChart = getFlowChartForAI();
      
      // Generate AI response with simplified parameters
      const response = await aiService.generateResponse(
        messageParts,
        useSearch,
        currentFlowChart,
        history
      );
      
      if (response.success) {
        let aiMessage;
        
        // Handle function calls (for flowcharts)
        if (response.functionCalls && response.functionCalls.length > 0) {
          const functionCall = response.functionCalls[0];
          
          if (functionCall.name === 'createFlowchart') {
            const flowchartData = functionCall.args;
            
            // Handle AI flowchart creation/modification using context
            const chartId = handleAIModification(flowchartData);
            
            // Automatically open the flowchart editor if it's not already open
            if (!isEditorOpen) {
              openEditor();
            }
            
            // Create AI message with flowchart reference
            aiMessage = {
              role: "model",
              parts: [
                { text: isEditorOpen 
                  ? `I've updated your flowchart: "${flowchartData.title}". You can see the changes in the editor on the right.`
                  : `I've created a flowchart for you: "${flowchartData.title}". The editor is now open on the right so you can view and modify it. You can continue chatting here to make further changes!`
                },
                { flowchart: flowchartData, chartId }
              ]
            };
          } else {
            // Handle other function calls if any
            aiMessage = { role: "model", parts: [{ text: "Function call completed." }] };
          }
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
        <div className={`h-full flex flex-col justify-start items-center ${isEditorOpen ? 'w-1/2' : 'w-full'}`}>
          {history.length === 0 && !loading ? (
            <WelcomeScreen
              inputText={inputText}
              handleChange={handleChange}
              handlePaste={handlePaste}
              fetchAIResponse={fetchAIResponse}
              loading={loading}
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
              getFileIcon={getFileIcon}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              toggleMode={toggleMode}
              useSearch={useSearch}
              openEditor={openEditor}
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
              selectedFiles={selectedFiles}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
              getFileIcon={getFileIcon}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              toggleMode={toggleMode}
              useSearch={useSearch}
              openEditor={openEditor}
              inputRef={inputRef}
              fileInputRef={fileInputRef}
              dropdownRef2={dropdownRef2}
            />
          )}
        </div>

        {/* Flow Chart Editor - appears as sibling in flex layout */}
        {isEditorOpen && (
          <div className="h-full bg-black w-1/2">
            <FlowChartEditor />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <FlowChartProvider>
      <AppContent />
    </FlowChartProvider>
  );
}

export default App;
