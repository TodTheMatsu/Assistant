import React from 'react';
import {
  ReactFlow,
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

  const nodesWithColors = (flowchartData.nodes || []).map(node => ({
    ...node,
    style: {
      ...node.style,
      backgroundColor: getNodeColor(node),
      color: '#ffffff',
      border: '2px solid #ffffff',
      borderRadius: '8px',
      padding: '10px',
      fontWeight: '500',
    }
  }));

  return (
    <div style={{ width: '100%', height: '600px', minWidth: '800px' }}>
      <ReactFlow
        nodes={nodesWithColors}
        edges={flowchartData.edges || []}
        fitView
      />
    </div>
  );
};

export default FlowChart;
