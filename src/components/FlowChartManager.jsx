import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FlowChart from './FlowChart.jsx';

const FlowChartManager = ({ flowcharts, onFlowchartUpdate }) => {
  const [activeFlowchart, setActiveFlowchart] = useState(0);

  const handleNodesChange = (changes) => {
    if (onFlowchartUpdate) {
      const updatedFlowchart = { ...flowcharts[activeFlowchart] };
      // Apply changes to nodes
      onFlowchartUpdate(activeFlowchart, updatedFlowchart);
    }
  };

  const handleEdgesChange = (changes) => {
    if (onFlowchartUpdate) {
      const updatedFlowchart = { ...flowcharts[activeFlowchart] };
      // Apply changes to edges
      onFlowchartUpdate(activeFlowchart, updatedFlowchart);
    }
  };

  if (!flowcharts || flowcharts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No flowcharts available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Flowchart tabs if multiple flowcharts */}
      {flowcharts.length > 1 && (
        <div className="flex space-x-2 mb-4">
          {flowcharts.map((flowchart, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveFlowchart(index)}
              className={`relative px-4 py-2 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                activeFlowchart === index
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/50'
                  : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ isolation: 'isolate' }}
            >
              {flowchart.title || `Flowchart ${index + 1}`}
            </motion.button>
          ))}
        </div>
      )}

      {/* Active flowchart */}
      <div className="relative bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[inset_0px_30px_600px_rgba(255,255,255,.01)] overflow-hidden">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        <div className="relative z-10 p-6">
          {flowcharts[activeFlowchart]?.title && (
            <motion.h3 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-semibold text-white mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text"
            >
              {flowcharts[activeFlowchart].title}
            </motion.h3>
          )}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <FlowChart
              flowchartData={flowcharts[activeFlowchart]}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          </motion.div>
          
          {flowcharts[activeFlowchart]?.description && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-sm text-white/60 mt-6 leading-relaxed"
            >
              {flowcharts[activeFlowchart].description}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FlowChartManager;
