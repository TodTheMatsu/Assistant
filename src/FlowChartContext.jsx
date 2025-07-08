import React, { createContext, useContext, useState, useCallback } from 'react';

const FlowChartContext = createContext();

export const useFlowChart = () => {
  const context = useContext(FlowChartContext);
  if (!context) {
    throw new Error('useFlowChart must be used within a FlowChartProvider');
  }
  return context;
};

export const FlowChartProvider = ({ children }) => {
  // State for managing flow charts per chat
  const [chatFlowCharts, setChatFlowCharts] = useState({}); // { chatId: { flowCharts: [...], activeFlowChartId: '...' } }
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Get current chat's flowchart data
  const currentChatData = chatFlowCharts[currentChatId] || { flowCharts: [], activeFlowChartId: null };
  const flowCharts = currentChatData.flowCharts;
  const activeFlowChartId = currentChatData.activeFlowChartId;

  // Get the currently active flow chart
  const activeFlowChart = flowCharts.find(chart => chart.id === activeFlowChartId);

  // Set the current chat (called when switching chats)
  const setCurrentChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
    // Close editor when switching chats to avoid confusion
    setIsEditorOpen(false);
  }, []);

  // Create a new flow chart for the current chat
  const createFlowChart = useCallback((flowChartData) => {
    if (!currentChatId) return null;
    
    const newFlowChart = {
      id: Date.now().toString(),
      ...flowChartData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setChatFlowCharts(prev => ({
      ...prev,
      [currentChatId]: {
        flowCharts: [...(prev[currentChatId]?.flowCharts || []), newFlowChart],
        activeFlowChartId: newFlowChart.id
      }
    }));
    
    return newFlowChart;
  }, [currentChatId]);

  // Update an existing flow chart in the current chat
  const updateFlowChart = useCallback((flowChartId, updates) => {
    if (!currentChatId) return;
    
    setChatFlowCharts(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        flowCharts: prev[currentChatId]?.flowCharts.map(chart => 
          chart.id === flowChartId 
            ? { 
                ...chart, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              }
            : chart
        ) || []
      }
    }));
  }, [currentChatId]);

  // Update the active flow chart in the current chat
  const updateActiveFlowChart = useCallback((updates) => {
    if (activeFlowChartId && currentChatId) {
      updateFlowChart(activeFlowChartId, updates);
    }
  }, [activeFlowChartId, currentChatId, updateFlowChart]);

  // Delete a flow chart from the current chat
  const deleteFlowChart = useCallback((flowChartId) => {
    if (!currentChatId) return;
    
    setChatFlowCharts(prev => {
      const currentData = prev[currentChatId] || { flowCharts: [], activeFlowChartId: null };
      const remainingCharts = currentData.flowCharts.filter(chart => chart.id !== flowChartId);
      
      return {
        ...prev,
        [currentChatId]: {
          flowCharts: remainingCharts,
          activeFlowChartId: currentData.activeFlowChartId === flowChartId 
            ? (remainingCharts.length > 0 ? remainingCharts[0].id : null)
            : currentData.activeFlowChartId
        }
      };
    });
  }, [currentChatId]);

  // Set the active flow chart for the current chat
  const setActiveFlowChart = useCallback((flowChartId) => {
    if (!currentChatId) return;
    
    setChatFlowCharts(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        activeFlowChartId: flowChartId
      }
    }));
  }, [currentChatId]);

  // Open/close the editor
  const openEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  // Handle AI modifications to the active flow chart
  const handleAIModification = useCallback((aiFlowChartData) => {
    if (!currentChatId) return null;
    
    if (activeFlowChartId) {
      // Update existing flow chart with AI modifications
      updateActiveFlowChart(aiFlowChartData);
      return activeFlowChartId;
    } else {
      // Create new flow chart if none is active
      const newChart = createFlowChart(aiFlowChartData);
      return newChart?.id;
    }
  }, [activeFlowChartId, currentChatId, updateActiveFlowChart, createFlowChart]);

  // Get flow chart data for AI (current state to send to AI for modifications)
  const getFlowChartForAI = useCallback(() => {
    return activeFlowChart || null;
  }, [activeFlowChart]);

  const value = {
    // State
    flowCharts,
    activeFlowChart,
    activeFlowChartId,
    isEditorOpen,
    currentChatId,
    
    // Actions
    setCurrentChat,
    createFlowChart,
    updateFlowChart,
    updateActiveFlowChart,
    deleteFlowChart,
    setActiveFlowChart,
    openEditor,
    closeEditor,
    handleAIModification,
    getFlowChartForAI
  };

  return (
    <FlowChartContext.Provider value={value}>
      {children}
    </FlowChartContext.Provider>
  );
};

export default FlowChartContext;
