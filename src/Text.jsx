import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

function Text({ result, parts, role, loading, citations, thoughts, usageMetadata }) {
  const delayTime = loading ? 0.5 : 0.2;
  const [showThoughts, setShowThoughts] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  // Use parts if provided, otherwise fall back to result for backward compatibility
  const messageParts = parts || (result ? [{ text: result }] : []);

  // Function to render text with citations - removes citation markers completely
  const renderTextWithCitations = (text) => {
    if (!citations || !text) return text;
    
    // Remove citation markers entirely from the text
    return text.replace(/<cite>(\d+)<\/cite>/g, '');
  };

  // Function to render citation list at the bottom
  const renderCitationList = () => {
    if (!citations || citations.length === 0) return null;
    
    // Collect all unique sources across all citations
    const allUniqueSources = [];
    const seenUris = new Set();
    
    citations.forEach(citation => {
      citation.sources.forEach(source => {
        if (!seenUris.has(source.uri)) {
          seenUris.add(source.uri);
          allUniqueSources.push(source);
        }
      });
    });
    
    return (
      <div className="mt-6 pt-4 border-t border-sage border-opacity-30">
        <button
          onClick={() => setSourcesExpanded(!sourcesExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-light-beige text-opacity-70 hover:text-light-beige hover:text-opacity-90 transition-colors duration-200 mb-3"
        >
          <span>Sources ({allUniqueSources.length})</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${sourcesExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`flex flex-wrap gap-2 ${!sourcesExpanded ? 'flex items-center' : ''}`}>
          {!sourcesExpanded ? (
            <div className="flex items-center">
              {allUniqueSources.map((source, sourceIndex) => (
                <a
                  key={sourceIndex}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center hover:scale-110 hover:z-10 transition-all duration-200 rounded-md p-1.5"
                  style={{ marginLeft: sourceIndex > 0 ? '-20px' : '0' }}
                  title={source.title || source.uri}
                >
                  {source.faviconUrl && (
                    <img 
                      src={source.faviconUrl} 
                      alt="" 
                      className="w-5 h-5 bg-white rounded-full p-0.5 flex-shrink-0"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </a>
              ))}
            </div>
          ) : (
            allUniqueSources.map((source, sourceIndex) => (
              <a
                key={sourceIndex}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 font-semibold text-sage bg-dark-gray/50 hover:scale-105 hover:text-sage/80 transition-all duration-200 text-sm outline outline-1 outline-sage/30 rounded-md p-2"
                title={source.uri}
              >
                {source.faviconUrl && (
                  <img 
                    src={source.faviconUrl} 
                    alt="" 
                    className="w-6 h-6 bg-white rounded-full p-0.5 flex-shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <span>{source.title}</span>
              </a>
            ))
          )}
        </div>
      </div>
    );
  };

  const customRenderers = {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-medium mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-normal mb-2">{children}</h4>,
    h5: ({ children }) => <h5 className="text-base font-normal mb-2">{children}</h5>,
    h6: ({ children }) => <h6 className="text-sm font-normal mb-2">{children}</h6>,

    ul: ({ children }) => (
      <ul className="list-disc pl-5 mb-2 text-light-beige">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-2 text-light-beige">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sage hover:text-sage/80 transition-colors duration-200"
        title={href}
      >
        {children}
      </a>
    ),

    code: ({ children, className }) => {
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className="bg-sage bg-opacity-15 text-light-beige px-2 py-1 rounded-md font-mono text-sm border border-sage border-opacity-20">
            {children}
          </code>
        );
      }
      
      return <code className={className}>{children}</code>;
    },

    pre: ({ children }) => {
      const [copied, setCopied] = useState(false);
      
      const copyToClipboard = async () => {
        try {
          const codeElement = children?.props?.children;
          const codeText = typeof codeElement === 'string' ? codeElement : children?.props?.children?.toString() || '';
          await navigator.clipboard.writeText(codeText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
        }
      };

      // Extract language from className if available
      const className = children?.props?.className || '';
      const language = className.replace('language-', '').toLowerCase();
      const hasLanguage = language && language !== 'undefined';
    
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative group my-4"
        >
          {/* Header with language label and copy button */}
          <div className="flex items-center justify-between bg-dark-charcoal px-4 py-2 rounded-t-lg border-b border-sage/20">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              {hasLanguage && (
                <span className="text-light-beige text-opacity-60 text-xs font-mono uppercase tracking-wide">
                  {language}
                </span>
              )}
            </div>
            
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-1 rounded-md bg-sage/20 hover:bg-sage/30 transition-colors duration-200 text-light-beige/70 hover:text-light-beige"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium text-sage">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">Copy</span>
                </>
              )}
            </motion.button>
          </div>
          
          {/* Code content */}
          <pre className="bg-dark-gray text-light-beige text-sm p-4 rounded-b-lg overflow-x-auto scrollbar-thin scrollbar-thumb-sage scrollbar-track-dark-charcoal hover:scrollbar-thumb-sage/80">
            <code className="font-mono leading-relaxed">
              {children}
            </code>
          </pre>
        </motion.div>
      );
    },

    blockquote: ({ children }) => (
      <blockquote 
        className="border-l-4 border-sage bg-dark-gray bg-opacity-50 backdrop-blur-sm pl-6 pr-4 py-3 my-4 rounded-r-lg shadow-lg"
      >
        <div className="text-light-beige text-opacity-90 font-light italic text-lg leading-relaxed">
          {children}
        </div>
      </blockquote>
    ),
    
  };

  // Simplified thinking animation that won't break layout
  const getThinkingAnimation = () => ({
    boxShadow: [
      "0px 0px 0px rgba(59, 130, 246, 0)",
      "0px 0px 15px rgba(59, 130, 246, 0.4)",
      "0px 0px 25px rgba(59, 130, 246, 0.6)",
      "0px 0px 15px rgba(59, 130, 246, 0.4)",
      "0px 0px 0px rgba(59, 130, 246, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  });

  return (
    <div className={`w-full flex ${role === "user" ?  "justify-end" :  " justify-start"}`}>
      {loading ? (
        // Fake text generation animation with looping
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full py-2 px-2"
        >
          <div className="space-y-3 overflow-hidden">
            {/* Continuously generating lines */}
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: [`0%`, `${Math.random() * 30 + 50}%`, `${Math.random() * 30 + 50}%`],
                  opacity: [0, 0.3, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: index * 0.4,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut"
                }}
                className="h-4 bg-light-beige rounded-full"
                style={{ 
                  opacity: Math.max(0.05, 0.25 - index * 0.04)
                }}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        // Normal message bubble
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: delayTime }}
          className={`inline-flex rounded-2xl py-2 px-2
          ${role === "model" ? "w-full" : "max-w-[80%] backdrop-blur-xl border-2 border-sage border-opacity-30 shadow-xl bg-dark-gray bg-opacity-50"}`}
        >
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: delayTime + 0.2, duration: 0.3 }}
            className="font-thin text-light-beige text-xl max-w-[100%]"
          >
            {messageParts.map((part, index) => (
              <div key={index} className="mb-2 last:mb-0">
                {part.text && (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={customRenderers} 
                  >
                    {renderTextWithCitations(part.text)}
                  </ReactMarkdown>
                )}
                {part.inlineData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: delayTime + 0.1 }}
                    className="mt-2"
                  >
                    <img 
                      src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                      alt="Uploaded image"
                      className="max-w-full max-h-64 object-contain rounded-lg border border-sage/30 shadow-lg"
                    />
                  </motion.div>
                )}
                {part.fileInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: delayTime + 0.1 }}
                    className="mt-2 p-3 bg-sage/10 rounded-lg border border-sage/20 flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-light-beige/70" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-light-beige truncate">
                        {part.fileInfo.name}
                      </p>
                      <p className="text-xs text-light-beige/60">
                        {part.fileInfo.type} • {(part.fileInfo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
            {renderCitationList()}
            
            {/* Render thoughts section if available */}
            {thoughts && thoughts.length > 0 && role === 'model' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: delayTime + 0.4 }}
                className="mt-4 pt-4 border-t border-sage/20"
              >
                <button
                  onClick={() => setShowThoughts(!showThoughts)}
                  className="flex items-center space-x-2 text-sm text-light-beige/70 hover:text-light-beige/90 transition-colors duration-200 mb-2"
                >
                  <span className="font-medium">💭 Thought Process</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${showThoughts ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showThoughts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-sage/5 rounded-lg p-3 border border-sage/10"
                  >
                    {thoughts.map((thought, idx) => (
                      <div key={idx} className="mb-2 last:mb-0 text-sm text-light-beige/80 italic prose-sm">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          components={customRenderers}
                        >
                          {thought}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}


    </div>
  );
}

export default Text;
