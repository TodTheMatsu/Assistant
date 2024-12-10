import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "motion/react"
function App() {
  const [result, setResult] = useState("");
  const renderText = (text, textSize = 'text-xl') => (
    text.split('').map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { delay: index * 0.005, ease: 'easeOut', duration: 1 } }}
        viewport={{ once: true }}
        className={`text-white font-sans font-thin mx-auto text-center w-full ${textSize}`}
      >
        {char}
      </motion.span>
    ))
  );
    const fetchAIResponse = async (e) => {
      e.preventDefault();
      console.log(e)
      try {
        const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const response = await model.generateContent(e.target[0].value);
        setResult(response.response.text());
      } catch (error) {
        console.error("Error generating AI content:", error);
      }
    };

  return (
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="bg-gray-800 w-1/2 h-1/2 flex flex-col justify-center items-center rounded-xl">
          <motion.p className="text-3xl font-thin text-white">{renderText(result)}</motion.p>
        </div>
        <form onSubmit={fetchAIResponse}><input  className="bg-gray-600 text-center text-4xl text-white w-1/2 h-24 rounded-xl"/></form>
        
      </div>
    </div>
  );
}

export default App;
