import React, { useCallback } from 'react';
import {
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const FlowChart = ({ flowchartData }) => {
  // Add colors to nodes based on their type or data
  const getNodeColor = (node) => {
    // Check both node.type and node.data.type for the node type
    const nodeType = node.type || node.data?.type;
    if (nodeType === 'start') return '#4ade80'; // green
    if (nodeType === 'end') return '#f87171'; // red
    if (nodeType === 'decision') return '#fbbf24'; // yellow
    if (nodeType === 'process') return '#60a5fa'; // blue
    if (nodeType === 'data') return '#f97316'; // orange
    return '#a78bfa'; // purple (default)
  };

  const nodesWithColors = (flowchartData.nodes || []).map(node => {
    // Map custom types to ReactFlow built-in types
    let reactFlowType = 'default';
    const nodeType = node.type || node.data?.type;
    
    if (nodeType === 'start') {
      reactFlowType = 'input'; // ReactFlow's input node for start
    } else if (nodeType === 'end') {
      reactFlowType = 'output'; // ReactFlow's output node for end
    } else {
      reactFlowType = 'default'; // Default for process, decision, data, etc.
    }

    return {
      ...node,
      type: reactFlowType, // Use ReactFlow's built-in types
      style: {
        ...node.style,
        backgroundColor: getNodeColor(node),
        color: '#ffffff',
        border: '2px solid #ffffff',
        borderRadius: '8px',
        padding: '10px',
        fontWeight: '500',
      }
    };
  });

  // Handle ReactFlow initialization to fix connection handle positioning
  const onInit = useCallback((reactFlowInstance) => {
    // Small delay to ensure nodes are fully rendered before fitting view
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.1 });
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', minWidth: '800px' }}>
      <ReactFlow
        nodes={nodesWithColors}
        edges={flowchartData.edges || []}
        onInit={onInit}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        preventScrolling={false}
        minZoom={0.1}
        maxZoom={2}
      />
    </div>
  );
};

export default FlowChart;
