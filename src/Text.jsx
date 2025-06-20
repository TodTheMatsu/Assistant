import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Text({ result, parts, role, loading }) {
  const delayTime = loading ? 0.5 : 0.2;

  // Use parts if provided, otherwise fall back to result for backward compatibility
  const messageParts = parts || (result ? [{ text: result }] : []);

  const customRenderers = {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-medium mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-normal mb-2">{children}</h4>,
    h5: ({ children }) => <h5 className="text-base font-normal mb-2">{children}</h5>,
    h6: ({ children }) => <h6 className="text-sm font-normal mb-2">{children}</h6>,

    ul: ({ children }) => (
      <ul className="list-disc pl-5 mb-2 text-white">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-2 text-white">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-green-500 hover:text-green-400 transition-colors duration-200"
        title={href}
      >
        <svg 
          className="w-4 h-4 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
        {children}
      </a>
    ),

    code: ({ children }) => (
      <code className=" text-white p-1 rounded">{children}</code>
    ),

    pre: ({ children }) => {
      const copyToClipboard = () => {
        const codeText = children.props.children
        navigator.clipboard.writeText(codeText);
      };
    
      return (
        <div className="relative">
          <pre className="bg-gray-900 max-w-[100%] text-white text-sm p-4 rounded-lg overflow-auto">
            {children}
          </pre>
          <motion.button
            onClick={copyToClipboard}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 right-2 bg-blue-900  text-white py-1 px-1 rounded-full  text-sm hover:bg-blue-600"
          >
            Copy
          </motion.button>
        </div>
      );
    },
    
  };

  return (
    <div className={`w-full flex ${role === "user" ?  "justify-end" :  " justify-start"}`}>
      <motion.div 
        initial={{height: 0, opacity: 0 , boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)"}} 
        animate={{height: "auto", opacity: 1, transition: {duration: 0.1, delay: delayTime, ease: "linear"},...(loading ? {boxShadow: "0px 0px 15px rgba(59, 130, 246, .8)",   } : {})}}
        className={`inline-flex backdrop-blur-xl border-2 border-white border-opacity-0 max-w-[80%] rounded-2xl py-2 px-2 shadow-xl ${loading ? "animate-bounce outline-blue-700 outline-8" : ""}
        ${role === "model" ? "bg-blue-500 bg-opacity-0" : "bg-white bg-opacity-20"}`}
      >
        <motion.div 
          initial={{opacity: 0}} 
          animate={{opacity: 1, transition: {delay: delayTime + 0.2, duration: 0.1}}}
          className="font-thin text-white text-xl max-w-[100%]"
        >
          {messageParts.map((part, index) => (
            <div key={index} className="mb-2 last:mb-0">
              {part.text && (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  components={customRenderers} 
                >
                  {part.text}
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
                    className="max-w-full max-h-64 object-contain rounded-lg border border-white/20 shadow-lg"
                  />
                </motion.div>
              )}
              {part.fileInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: delayTime + 0.1 }}
                  className="mt-2 p-3 bg-white/10 rounded-lg border border-white/20 flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {part.fileInfo.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {part.fileInfo.type} • {(part.fileInfo.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Text;
