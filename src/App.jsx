import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "motion/react";
import Text from "./Text.jsx";

function App() {
  const [results, setResults] = useState([]);
  const [inputText, setInput] = useState("");
  const resultsRef = useRef(null);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      setInput("");
      const response = await model.generateContent(e.target[0].value);
      const newText = response.response.text();
      setResults((prevResults) => [...prevResults, newText]);
    } catch (error) {
      console.error("Error generating AI content:", error);
    }
  };

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [results]);

  return (
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="bg-white bg-opacity-20 w-[1600px] h-[90%] flex flex-col justify-start items-center rounded-xl">
          <div
            ref={resultsRef} 
            className="w-full h-full flex flex-col justify-start items-start rounded-xl overflow-auto space-y-5 px-10 py-10"
          >
            {results.map((text, index) => (
              <Text key={index} result={text} />
            ))}
          </div>
          <form className="w-full" onSubmit={fetchAIResponse}>
            <motion.input
              type="text"
              value={inputText}
              onChange={handleChange}
              placeholder="Enter text"
              initial={{boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)"}}
              transition={{duration: 0.75, ease:"linear"}}
              whileFocus={{boxShadow: "0px 10px 50px rgba(59, 130, 246, .8)",}}
              className="bg-white bg-opacity-20 text-left text-4xl text-white w-full h-24 rounded-xl focus:outline-none focus:border-2 border-blue-500 ring-blue-500"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
