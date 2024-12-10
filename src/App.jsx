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
        <div className="bg-gray-800 w-[1600px] h-[90%] flex flex-col justify-start items-center rounded-xl">
          <div
            ref={resultsRef} 
            className="w-full h-full flex flex-col justify-start items-start rounded-xl overflow-y-scroll space-y-5 px-10 py-10"
          >
            {results.map((text, index) => (
              <Text key={index} result={text} />
            ))}
          </div>
          <form className="w-full" onSubmit={fetchAIResponse}>
            <input
              type="text"
              value={inputText}
              onChange={handleChange}
              placeholder="Enter text"
              className="bg-gray-600 text-left text-4xl text-white w-full h-24 rounded-xl"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
