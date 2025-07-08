import { useState, useCallback } from 'react';
import AIService from '../services/AIService.js';

export const useChatHistory = () => {
  const [history, setHistory] = useState([]);
  const [previousChats, setPreviousChats] = useState([]);
  const [onExistingChat, setOnExistingChat] = useState(false);
  const [currentChatIndex, setCurrentChatIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const aiService = new AIService();

  const updateHistory = useCallback((newHistory) => {
    setHistory(newHistory);
  }, []);

  const addToHistory = useCallback((entry) => {
    setHistory(prev => [...prev, entry]);
  }, []);

  const createChat = useCallback(async () => {
    // Clear any ongoing loading state when creating a new chat
    setLoading(false);
    setOnExistingChat(false);
    setCurrentChatIndex(-1);
    setHistory([]);
  }, []);

  const loadChat = useCallback((chat, index) => {
    // Clear any ongoing loading state when switching chats
    setLoading(false);
    setOnExistingChat(true);
    setCurrentChatIndex(index);
    setHistory(chat.history);
  }, []);

  const deleteChat = useCallback((indexToDelete, e) => {
    e.stopPropagation(); // Prevent triggering the loadChat function
    
    setPreviousChats((prev) => prev.filter((_, index) => index !== indexToDelete));
    
    // If we're currently viewing the chat being deleted, start a new chat
    if (currentChatIndex === indexToDelete) {
      setOnExistingChat(false);
      setCurrentChatIndex(-1);
      setHistory([]);
    } else if (currentChatIndex > indexToDelete) {
      // If we're viewing a chat that comes after the deleted one, adjust the index
      setCurrentChatIndex(currentChatIndex - 1);
    }
  }, [currentChatIndex]);

  const saveChatHistory = useCallback(async (updatedHistory) => {
    try {
      const requestChatContext = {
        isExistingChat: onExistingChat,
        chatIndex: currentChatIndex,
        currentHistory: [...history],
        requestId: Date.now() + Math.random(),
        historyLength: history.length
      };

      const isStillOnSameChat = (requestChatContext.isExistingChat === onExistingChat && 
                                requestChatContext.chatIndex === currentChatIndex) ||
                               (!requestChatContext.isExistingChat && !onExistingChat);

      if (onExistingChat && currentChatIndex >= 0) {
        // Update existing chat
        setPreviousChats((prev) =>
          prev.map((chat, index) =>
            index === currentChatIndex
              ? { ...chat, history: updatedHistory }
              : chat
          )
        );
        
        // Only update current history if we're still viewing the same chat
        if (isStillOnSameChat) {
          setHistory(updatedHistory);
        }
      } else {
        // This is a new conversation, save it automatically
        const newChatIndex = previousChats.length;
        setPreviousChats((prev) => [...prev, { history: updatedHistory, title: "..." }]);
        
        // Update current chat state
        if (isStillOnSameChat) {
          setOnExistingChat(true);
          setCurrentChatIndex(newChatIndex);
          setHistory(updatedHistory);
        }
        
        // Generate title asynchronously
        setTimeout(async () => {
          try {
            const title = await aiService.generateTitle(updatedHistory);
            setPreviousChats((prev) =>
              prev.map((chat, index) =>
                index === newChatIndex ? { ...chat, title } : chat
              )
            );
          } catch (error) {
            console.error("Error generating title:", error);
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [onExistingChat, currentChatIndex, history, previousChats, aiService]);

  return {
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
  };
};
