import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "motion/react"
import Text from "./Text.jsx";
function App() {
  const [results, setResults] = useState("");
  const [inputText, setInput] = useState("");
  const handleChange = (e) => {
    setInput(e.target.value);
  };
    const fetchAIResponse = async (e) => {
      e.preventDefault();
      console.log(e)
      try {
        const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        setInput("")
        const response = await model.generateContent(e.target[0].value);
        const newText = response.response.text();

        // Add the new result to the list of results
        setResults((prevResults) => [...prevResults, newText]);
      } catch (error) {
        console.error("Error generating AI content:", error);
      }
    };

  return (
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="bg-gray-800 w-[1600px] h-[90%] flex flex-col justify-start items-center rounded-xl">
          <div className="w-full h-full ustify-center items-start flex flex-col rounded-xl overflow-auto space-y-5 px-10 py-10">
            {Object.values(results).map((text, index) => ( <Text result={text} />))}
          </div>
          <form className="w-full" onSubmit={fetchAIResponse}><input type="text" value={inputText} onChange={handleChange} placeholder="Enter text" className="bg-gray-600 text-left text-4xl text-white w-full h-24 rounded-xl"/></form>
        </div>
       
      </div>
    </div>
  );
}

export default App;
