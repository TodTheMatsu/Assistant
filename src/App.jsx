import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "motion/react";
import Text from "./Text.jsx";

function App() {
  const [inputText, setInput] = useState(""); // For input text
  const [loading, setLoading] = useState(false); // Loading state
  const [history, setHistory] = useState([]); // To store the conversation history
  const resultsRef = useRef(null);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      setInput("");
      const chat = model.startChat({ history: history });
      const result = await chat.sendMessage(e.target[0].value);
      console.log(history)
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="bg-white bg-opacity-20 w-[1600px] h-[90%] flex flex-col justify-start items-center rounded-xl">
          <div
            ref={resultsRef}
            className="w-full h-full flex flex-col justify-start items-start rounded-xl overflow-auto space-y-5 px-10 py-10"
          >
            {history.map((entry, index) => (
              entry.parts.map((part, partIndex) => (
                <Text key={`${index}-${partIndex}`} result={part.text} />
              ))
            ))}
            {loading && <Text result="Thinking..." />} {/* Render loading text */}
          </div>
          <form className="w-full" onSubmit={fetchAIResponse}>
            <motion.input
              type="text"
              value={inputText}
              onChange={handleChange}
              placeholder="Enter text"
              initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
              transition={{ duration: 0.75, ease: "linear" }}
              whileFocus={{ boxShadow: "0px 10px 50px rgba(59, 130, 246, .8)" }}
              className="bg-white bg-opacity-20 text-left text-4xl text-white w-full h-24 rounded-xl focus:outline-none focus:border-2 border-blue-500 ring-blue-500"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
