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
  // State for managing flow charts
  const [flowCharts, setFlowCharts] = useState([]);
  const [activeFlowChartId, setActiveFlowChartId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Get the currently active flow chart
  const activeFlowChart = flowCharts.find(chart => chart.id === activeFlowChartId);

  // Create a new flow chart
  const createFlowChart = useCallback((flowChartData) => {
    const newFlowChart = {
      id: Date.now().toString(),
      ...flowChartData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setFlowCharts(prev => [...prev, newFlowChart]);
    setActiveFlowChartId(newFlowChart.id);
    return newFlowChart;
  }, []);

  // Update an existing flow chart
  const updateFlowChart = useCallback((flowChartId, updates) => {
    setFlowCharts(prev => prev.map(chart => 
      chart.id === flowChartId 
        ? { 
            ...chart, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          }
        : chart
    ));
  }, []);

  // Update the active flow chart
  const updateActiveFlowChart = useCallback((updates) => {
    if (activeFlowChartId) {
      updateFlowChart(activeFlowChartId, updates);
    }
  }, [activeFlowChartId, updateFlowChart]);

  // Delete a flow chart
  const deleteFlowChart = useCallback((flowChartId) => {
    setFlowCharts(prev => prev.filter(chart => chart.id !== flowChartId));
    if (activeFlowChartId === flowChartId) {
      const remaining = flowCharts.filter(chart => chart.id !== flowChartId);
      setActiveFlowChartId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeFlowChartId, flowCharts]);

  // Set the active flow chart
  const setActiveFlowChart = useCallback((flowChartId) => {
    setActiveFlowChartId(flowChartId);
  }, []);

  // Open/close the editor
  const openEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  // Handle AI modifications to the active flow chart
  const handleAIModification = useCallback((aiFlowChartData) => {
    if (activeFlowChartId) {
      // Update existing flow chart with AI modifications
      updateActiveFlowChart(aiFlowChartData);
    } else {
      // Create new flow chart if none is active
      createFlowChart(aiFlowChartData);
    }
  }, [activeFlowChartId, updateActiveFlowChart, createFlowChart]);

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
    
    // Actions
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
