import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Text({ result, role, loading }) {
  const delayTime = loading ? 0.5 : 0.2;

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
        className="text-green-500 hover:underline font-semibold"
      >
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
        <motion.p 
          initial={{opacity: 0}} 
          animate={{opacity: 1, transition: {delay: delayTime + 0.2, duration: 0.1}}}
          className="font-thin text-white text-xl max-w-[100%]"
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={customRenderers} 
          >
            {result}
          </ReactMarkdown>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Text;
