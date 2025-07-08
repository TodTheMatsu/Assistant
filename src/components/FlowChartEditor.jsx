import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowChart } from '../FlowChartContext.jsx';
import { GoogleGenerativeAI } from "@google/generative-ai";

const FlowChartEditor = () => {
  const { 
    activeFlowChart, 
    updateActiveFlowChart, 
    isEditorOpen, 
    closeEditor,
    flowCharts,
    setActiveFlowChart,
    createFlowChart
  } = useFlowChart();

  // Local state for ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState(activeFlowChart?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeFlowChart?.edges || []);
  const [isModified, setIsModified] = useState(false);
  
  // AI state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [flowchartHistory, setFlowchartHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // Initialize AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

  // Update local state when active flow chart changes
  React.useEffect(() => {
    if (activeFlowChart) {
      setNodes(activeFlowChart.nodes || []);
      setEdges(activeFlowChart.edges || []);
      setIsModified(false);
      
      // Initialize history with current state if it's empty
      if (flowchartHistory.length === 0 && (activeFlowChart.nodes?.length > 0 || activeFlowChart.edges?.length > 0)) {
        const initialState = { 
          nodes: activeFlowChart.nodes || [], 
          edges: activeFlowChart.edges || [], 
          timestamp: Date.now() 
        };
        setFlowchartHistory([initialState]);
        setCurrentHistoryIndex(0);
      }
    }
  }, [activeFlowChart, setNodes, setEdges, flowchartHistory.length]);

  // Handle connection creation
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
    setIsModified(true);
  }, [setEdges]);

  // Handle node changes
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    setIsModified(true);
  }, [onNodesChange]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    setIsModified(true);
  }, [onEdgesChange]);

  // Save changes to context
  const saveChanges = useCallback(() => {
    if (activeFlowChart && isModified) {
      updateActiveFlowChart({
        nodes,
        edges
      });
      setIsModified(false);
    }
  }, [activeFlowChart, nodes, edges, isModified, updateActiveFlowChart]);

  // Auto-save changes every few seconds
  React.useEffect(() => {
    if (isModified) {
      const timer = setTimeout(saveChanges, 2000);
      return () => clearTimeout(timer);
    }
  }, [isModified, saveChanges]);

  // Save AI changes to history (only for AI modifications)
  const saveAIChangeToHistory = useCallback(() => {
    const currentState = { nodes, edges, timestamp: Date.now() };
    
    // Remove any history after current index (when rolling back and making new changes)
    const newHistory = flowchartHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(currentState);
    
    // Keep only last 20 states to prevent memory issues
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setFlowchartHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, flowchartHistory, currentHistoryIndex]);

  // Add chat message
  const addChatMessage = useCallback((message, isUser = true, metadata = null) => {
    const chatMessage = {
      id: Date.now(),
      message,
      isUser,
      timestamp: new Date(),
      metadata
    };
    setChatHistory(prev => [...prev, chatMessage]);
  }, []);

  // Rollback to a previous state
  const rollbackToState = useCallback((index) => {
    if (index >= 0 && index < flowchartHistory.length) {
      const state = flowchartHistory[index];
      setNodes(state.nodes);
      setEdges(state.edges);
      setCurrentHistoryIndex(index);
      setIsModified(true);
      
      addChatMessage(`Rolled back to version ${index + 1}`, false, { type: 'rollback', index });
    }
  }, [flowchartHistory, setNodes, setEdges, addChatMessage]);

  // Handle close with save prompt
  const handleClose = useCallback(() => {
    if (isModified) {
      saveChanges();
    }
    closeEditor();
  }, [isModified, saveChanges, closeEditor]);

  // Add new node
  const addNode = useCallback((type = 'process') => {
    // Map custom types to ReactFlow built-in types
    let reactFlowType = 'default';
    if (type === 'start') {
      reactFlowType = 'input';
    } else if (type === 'end') {
      reactFlowType = 'output';
    } else {
      reactFlowType = 'default';
    }

    const newNode = {
      id: `node-${Date.now()}`,
      type: reactFlowType,
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: { 
        label: `New ${type}`,
        type 
      },
      style: {
        backgroundColor: getNodeColor(type),
        color: '#ffffff',
        border: '2px solid #ffffff',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: '500',
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setIsModified(true);
  }, [setNodes]);

  // Get node color based on type
  const getNodeColor = (nodeOrType) => {
    let type;
    if (typeof nodeOrType === 'string') {
      type = nodeOrType;
    } else {
      // Handle node object
      type = nodeOrType.type || nodeOrType.data?.type;
    }
    
    switch (type) {
      case 'start': return '#4ade80'; // green
      case 'end': return '#f87171'; // red
      case 'decision': return '#fbbf24'; // yellow
      case 'process': return '#60a5fa'; // blue
      case 'data': return '#f97316'; // orange
      default: return '#a78bfa'; // purple
    }
  };

  // Create new flow chart
  const handleNewFlowChart = useCallback(() => {
    const newChart = createFlowChart({
      title: 'New Flow Chart',
      description: 'A new flow chart',
      nodes: [],
      edges: []
    });
    setNodes([]);
    setEdges([]);
    setIsModified(false);
  }, [createFlowChart, setNodes, setEdges]);

  // Enhanced nodes with colors and styling
  const enhancedNodes = nodes.map(node => {
    // Use data.type first (our custom type), then fall back to node.type
    const nodeType = node.data?.type || node.type;
    return {
      ...node,
      style: {
        ...node.style,
        backgroundColor: getNodeColor(nodeType),
        color: '#ffffff',
        border: '2px solid #ffffff',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: '500',
        fontSize: '14px',
        minWidth: '120px',
        textAlign: 'center'
      }
    };
  });

  // AI function definition for flowchart modifications
  const flowchartFunction = {
    name: "modifyFlowchart",
    description: "Modifies an existing flowchart by updating, adding, or removing nodes and connections based on user instructions.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Updated title of the flowchart"
        },
        description: {
          type: "string",
          description: "Updated description of what the flowchart represents"
        },
        nodes: {
          type: "array",
          description: "Updated array of nodes in the flowchart",
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
          description: "Updated array of connections between nodes",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Unique identifier for the edge" },
              source: { type: "string", description: "ID of source node" },
              target: { type: "string", description: "ID of target node" },
              label: { type: "string", description: "Optional label for the edge" }
            },
            required: ["id", "source", "target"]
          }
        }
      },
      required: ["nodes", "edges"]
    }
  };

  // Handle AI modification request with retry logic
  const handleAiRequest = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // 1s, 2s, 3s delays
    
    if (!aiInput.trim() || aiLoading) return;
    
    // Add user message to chat on first attempt
    if (retryCount === 0) {
      addChatMessage(aiInput, true);
    }
    
    setAiLoading(true);
    try {
      console.log(`Starting AI request (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      
      const flowchartModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [{ functionDeclarations: [flowchartFunction] }]
      });

      // Prepare current flowchart state
      const currentState = {
        title: activeFlowChart?.title || "Current Flowchart",
        description: activeFlowChart?.description || "",
        nodes: nodes,
        edges: edges
      };

      console.log('Current state:', currentState);
      console.log('User input:', aiInput);

      const prompt = `Current flowchart state: ${JSON.stringify(currentState)}

User request: ${aiInput}

Please modify the flowchart according to the user's request. Maintain existing nodes and connections unless specifically asked to change them.`;

      const chat = flowchartModel.startChat({});
      const result = await chat.sendMessage(prompt);
      
      console.log('AI Response:', result.response);
      
      // Handle function calls
      try {
        const functionCalls = result.response.functionCalls();
        console.log('Function calls:', functionCalls);
        
        if (functionCalls && functionCalls.length > 0) {
          const modifiedFlowchart = functionCalls[0].args;
          console.log('Modified flowchart:', modifiedFlowchart);
          
          // Update the flowchart
          setNodes(modifiedFlowchart.nodes || []);
          setEdges(modifiedFlowchart.edges || []);
          setIsModified(true);
          
          // Save AI change to history for rollback
          setTimeout(() => {
            saveAIChangeToHistory();
          }, 0); // Use setTimeout to ensure state updates are complete
          
          // Update the context if we have an active flowchart
          if (activeFlowChart) {
            updateActiveFlowChart(modifiedFlowchart);
          }
          
          // Add success message to chat
          const changesSummary = `✅ Flowchart updated successfully! Modified ${modifiedFlowchart.nodes?.length || 0} nodes and ${modifiedFlowchart.edges?.length || 0} connections.`;
          addChatMessage(changesSummary, false, { 
            type: 'success', 
            changes: modifiedFlowchart,
            historyIndex: flowchartHistory.length 
          });
          
          console.log('Flowchart updated successfully');
          setAiInput('');
        } else {
          console.log('No function calls returned, trying text response');
          const textResponse = result.response.text();
          console.log('Text response:', textResponse);
          
          // If no function calls but we have retries left, try again
          if (retryCount < maxRetries) {
            console.log(`No function calls, retrying in ${retryDelay}ms...`);
            setTimeout(() => handleAiRequest(retryCount + 1), retryDelay);
            return; // Don't clear loading state yet
          }
          
          addChatMessage(`🤔 AI responded with text: "${textResponse}". I'll try to understand your request better next time.`, false, { type: 'info' });
          setAiInput('');
        }
      } catch (functionError) {
        console.error('Function call error:', functionError);
        
        // If we have retries left, try again
        if (retryCount < maxRetries) {
          console.log(`Function call failed, retrying in ${retryDelay}ms...`);
          setTimeout(() => handleAiRequest(retryCount + 1), retryDelay);
          return; // Don't clear loading state yet
        }
        
        // Try to get text response as fallback
        try {
          const textResponse = result.response.text();
          console.log('Fallback text response:', textResponse);
          addChatMessage(`❌ Failed to modify flowchart after ${maxRetries + 1} attempts. AI said: "${textResponse}"`, false, { type: 'error' });
        } catch (textError) {
          console.error('Could not get text response either:', textError);
          addChatMessage(`❌ AI request failed completely after ${maxRetries + 1} attempts. Please try again with a different request.`, false, { type: 'error' });
        }
        
        setAiInput('');
      }
      
    } catch (error) {
      console.error('AI modification error:', error);
      
      // Check if it's a retryable error
      const isRetryableError = 
        error.message.includes('rate limit') ||
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('503') ||
        error.message.includes('502') ||
        error.message.includes('500');
      
      if (isRetryableError && retryCount < maxRetries) {
        console.log(`Retryable error occurred, retrying in ${retryDelay}ms...`);
        setTimeout(() => handleAiRequest(retryCount + 1), retryDelay);
        return; // Don't clear loading state yet
      }
      
      addChatMessage(`❌ Communication error: ${error.message}`, false, { type: 'error', attempts: retryCount + 1 });
      setAiInput('');
    } finally {
      // Only clear loading if we're not retrying
      if (retryCount >= maxRetries || !aiLoading) {
        setAiLoading(false);
      }
    }
  };


  return (
    isEditorOpen && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full bg-gray-900 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-white">
                  {activeFlowChart?.title || 'Flow Chart Editor'}
                </h2>
                {isModified && (
                  <span className="text-yellow-400 text-sm">• Unsaved changes</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Flow Chart Selector */}
                {flowCharts.length > 1 && (
                  <select
                    value={activeFlowChart?.id || ''}
                    onChange={(e) => setActiveFlowChart(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
                  >
                    {flowCharts.map((chart) => (
                      <option key={chart.id} value={chart.id}>
                        {chart.title}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* New Chart Button */}
                <button
                  onClick={handleNewFlowChart}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  New Chart
                </button>
                
                {/* Save Button */}
                <button
                  onClick={saveChanges}
                  disabled={!isModified}
                  className={`px-3 py-1 rounded text-sm ${
                    isModified
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save
                </button>
                
                {/* AI Modify Button */}
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className={`px-3 py-1 rounded text-sm ${
                    showAiPanel
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  AI Modify
                </button>
                
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* ReactFlow Editor */}
          <div className="w-full h-full pt-16">
            <ReactFlow
              nodes={enhancedNodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap nodeColor={(node) => getNodeColor(node.type || node.data?.type)} />
              
              {/* Add Node Panel */}
              <Panel position="top-left" className="bg-gray-800 p-2 rounded border border-gray-600">
                <div className="text-white text-sm mb-2">Add Node:</div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => addNode('start')}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => addNode('process')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Process
                  </button>
                  <button
                    onClick={() => addNode('decision')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Decision
                  </button>
                  <button
                    onClick={() => addNode('data')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Data
                  </button>
                  <button
                    onClick={() => addNode('end')}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    End
                  </button>
                </div>
              </Panel>
            </ReactFlow>
          </div>
          
          {/* AI Chat & History Panel */}
          {showAiPanel && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-16 right-4 bottom-4 w-96 bg-gray-800 border border-gray-600 rounded-lg flex flex-col z-20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-600">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeTab === 'chat'
                      ? 'text-white bg-gray-700 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeTab === 'history'
                      ? 'text-white bg-gray-700 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History ({flowchartHistory.length})
                </button>
              </div>

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <>
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatHistory.length === 0 ? (
                      <div className="text-gray-400 text-center text-sm">
                        Ask me to modify your flowchart!<br/>
                        Examples:<br/>
                        • "Add a decision node after step 2"<br/>
                        • "Connect the start to the process"<br/>
                        • "Change the end node to say 'Complete'"
                      </div>
                    ) : (
                      chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                              msg.isUser
                                ? 'bg-purple-600 text-white'
                                : msg.metadata?.type === 'error'
                                ? 'bg-red-600 text-white'
                                : msg.metadata?.type === 'success'
                                ? 'bg-green-600 text-white'
                                : msg.metadata?.type === 'rollback'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-700 text-white'
                            }`}
                          >
                            {msg.message}
                            <div className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-600">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAiRequest();
                          }
                        }}
                        placeholder="Ask AI to modify the flowchart..."
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                        disabled={aiLoading}
                      />
                      <button
                        onClick={handleAiRequest}
                        disabled={!aiInput.trim() || aiLoading}
                        className={`px-3 py-2 rounded transition-colors text-sm ${
                          !aiInput.trim() || aiLoading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {flowchartHistory.length === 0 ? (
                      <div className="text-gray-400 text-center text-sm">
                        No history yet. Make some changes to see versions here.
                      </div>
                    ) : (
                      flowchartHistory.map((state, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded border ${
                            index === currentHistoryIndex
                              ? 'border-purple-500 bg-purple-600/20'
                              : 'border-gray-600 bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white text-sm font-medium">
                                Version {index + 1}
                                {index === currentHistoryIndex && (
                                  <span className="ml-2 px-2 py-1 bg-purple-600 text-xs rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {state.nodes.length} nodes, {state.edges.length} connections
                              </div>
                              <div className="text-gray-400 text-xs">
                                {new Date(state.timestamp).toLocaleString()}
                              </div>
                            </div>
                            {index !== currentHistoryIndex && (
                              <button
                                onClick={() => rollbackToState(index)}
                                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
    )
  );
};

export default FlowChartEditor;
