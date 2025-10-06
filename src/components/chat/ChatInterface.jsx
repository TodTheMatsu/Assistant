import React from 'react';
import { motion } from 'motion/react';
import Text from '../../Text.jsx';

const ChatInterface = ({ history, loading, resultsRef, useSearch }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }} 
      className="z-10 flex-grow w-full max-w-4xl h-full flex flex-col justify-start items-center min-h-0"
    >      
      <motion.div
        ref={resultsRef}
        className="w-full flex-1 flex flex-col justify-start items-start rounded-xl overflow-y-auto overflow-x-hidden space-y-5 px-10 py-10 scrollbar scrollbar-thumb-gray-400 scrollbar-corner-white scroll-smooth min-h-0"
      >
        {history.map((entry, index) => (
          <Text 
            key={index} 
            parts={entry.parts} 
            role={entry.role} 
            index={index} 
            citations={entry.citations}
            thoughts={entry.thoughts}
            usageMetadata={entry.usageMetadata}
          />
        ))}
        {loading && <Text key="loading" result="Thinking..." role='model' loading={true}/>}
      </motion.div>
    </motion.div>
  );
};

export default ChatInterface;
