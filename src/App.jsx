import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "motion/react";
import Text from "./Text.jsx";

function App() {
  const [inputText, setInput] = useState(""); // For input text
  const [loading, setLoading] = useState(false); // Loading state
  const [history, setHistory] = useState([]); // To store the conversation history
  const [clientHistory, setClientHistory] = useState([]);
  const resultsRef = useRef(null);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    setClientHistory((prevHistory) => [...prevHistory,   { role: "user", parts: [{ text: inputText }] },]);
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      setInput("");
      const chat = model.startChat({ history: history });
      const result = await chat.sendMessage(e.target[0].value);
      setClientHistory(history)
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (resultsRef.current) {
      setTimeout(() => {
        const { scrollHeight, clientHeight } = resultsRef.current;
        resultsRef.current.scrollTop = scrollHeight - clientHeight;
      }, 500); // Add a small delay to ensure the content is rendered
    }
  }, [clientHistory]);
  
  
  

  return (
  <AnimatePresence>
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-end">
        <div className="bg-white bg-opacity-20 w-[1600px] h-full flex flex-col justify-start items-center">
          <motion.div
            ref={resultsRef}
            className="w-full h-full flex flex-col justify-start items-start rounded-xl overflow-auto space-y-5 px-10 py-10 scrollbar scrollbar-thumb-gray-400 scrollbar-corner-white scroll-smooth">
            {clientHistory.map((entry, index) => (
                <Text key={index} result={entry.parts[0].text} role={entry.role} index={index} />
            ))}
            {loading && <Text result="Thinking..." role='model' loading={loading}/>}
          </motion.div>
          <form className="w-full flex justify-center items-center pb-5" onSubmit={fetchAIResponse}>
            <motion.input
              type="text"
              value={inputText}
              onChange={handleChange}
              placeholder="Enter text"
              initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)", width: "10%" }}
              transition={{ duration: 0.2, ease: "linear" }}
              whileFocus={{ boxShadow: "0px 10px 50px rgba(59, 130, 246, .8)",width: "50%" }}
              whileHover={{width: "50%"}}
              className="bg-white bg-opacity-20 text-left text-xl px-5
               text-white w-1/2 h-14 rounded-full focus:outline-none focus:border-2 border-blue-500 ring-blue-500 placeholder:text-md placeholder:text-center hover:placeholder:text-start focus:placeholder:text-start"
            />
          </form>
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
}

export default App;
