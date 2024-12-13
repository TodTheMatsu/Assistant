import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "motion/react";
import Text from "./Text.jsx";

function App() {
  const [inputText, setInput] = useState(""); // For input text
  const [loading, setLoading] = useState(false); // Loading state
  const [history, setHistory] = useState([]); // To store the conversation history
  const [clientHistory, setClientHistory] = useState([]);
  const [previousChats, setPreviousChats] = useState([]);
  const resultsRef = useRef(null);
  const genAI = new GoogleGenerativeAI("AIzaSyCwIq3Z0liDWLF2J1AF5waP87Mn0Rt2FSw");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setClientHistory((prevHistory) => [...prevHistory,   { role: "user", parts: [{ text: inputText }] },]);
    try {
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

  const loadChat = (chat) => {
    setClientHistory(chat.history);
    setHistory(chat.history);
    setInput("");
    console.log(previousChats)
  };

  const createTitle = async (chatHistory) => {
    try {
      const prompt = "Summarize this conversation in a few words: " + JSON.stringify(chatHistory);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error generating AI content:", error);
      return "Untitled Chat";
    }
  };
  

  const createChat = async () => {
    if (history.length === 0) {
      return; 
    }
    const updatedHistoy = [...history];
    const title = await createTitle(history); 
    setPreviousChats((prev) => [...prev, { history: updatedHistoy, title }]); 
    setHistory([]);
    setClientHistory([]); 
    setInput("");
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
      <div className="w-screen h-screen flex flex-row justify-center items-end">
      <motion.div initial={{x: -200 }} animate={{x: 0 ,transition: { duration: 0.5, delay: 2 } }} viewport={{ once: true }}
       className="bg-white bg-opacity-30 w-[10%] h-full flex flex-col justify-start items-center">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" className=" stroke-white" viewBox="0 0 20 20">
          <motion.path initial={{ pathLength: 0, fill: "none" }} animate={{ pathLength: 1,transition: { duration: 2, delay: 2.5 }}} viewport={{ once: true }}
          d="M7.39804 12.8085c.17624.1243.38672.1909.60239.1905.2159.0002.42643-.0673.602-.193.1775-.1305.31221-.3108.387-.518l.447-1.373c.11443-.3443.30748-.6572.56387-.9139.2563-.25674.569-.45021.9131-.5651l1.391-.45101c.152-.05435.2892-.14315.4011-.25944s.1953-.2569.2437-.41082c.0485-.15393.0606-.31697.0355-.47637-.0251-.15939-.0868-.3108-.1803-.44236-.1341-.18593-.325-.32317-.544-.391l-1.375-.447c-.3445-.11423-.6576-.3072-.91453-.56359-.25691-.25638-.45052-.56913-.56544-.91341l-.452-1.388c-.0723-.20231-.20582-.37707-.382-.5-.13266-.09373-.28536-.15521-.44595-.17956-.16059-.02434-.32465-.01088-.47912.03931-.15448.0502-.29511.13575-.41072.24985-.1156.11409-.20299.25359-.25521.4074l-.457 1.4c-.11459.33482-.30376.63923-.55321.89025-.24946.25101-.55269.44207-.88679.55875l-1.391.448c-.15178.05439-.28891.14317-.40066.25938-.11176.11622-.19511.25672-.24353.4105-.04842.15379-.0606.31669-.03559.47597.02502.15928.08655.31061.17978.44215.12784.17945.30862.31442.517.386l1.374.44499c.44011.14649.82656.42083 1.11.78801.16242.2106.28787.4473.371.7l.452 1.391c.07203.2033.20536.3792.38161.5035Zm6.13726 4.0425c.136.0962.2984.1479.465.148.1651.0001.3261-.0509.461-.146.1395-.0985.2445-.2384.3-.4l.248-.762c.0532-.1584.1422-.3025.26-.421.1174-.1185.2614-.2073.42-.259l.772-.252c.1577-.0545.2944-.1569.391-.293.0734-.103.1213-.2219.1398-.347.0185-.1251.0071-.2528-.0333-.3727-.0404-.1198-.1087-.2283-.1991-.3167-.0905-.0884-.2006-.154-.3214-.1916l-.764-.249c-.1581-.0525-.3019-.1412-.4199-.2588-.118-.1177-.2071-.2612-.2601-.4192l-.252-.773c-.0537-.1578-.1563-.2944-.293-.39-.102-.0729-.2198-.1209-.3437-.1399-.124-.0191-.2507-.0087-.3699.0302-.1193.0389-.2277.1053-.3165.1939-.0888.0885-.1556.1967-.1949.3158l-.247.762c-.0523.1577-.1398.3013-.256.42-.1147.1165-.2546.2051-.409.259l-.773.252c-.159.0539-.2971.1565-.3946.2933-.0975.1367-.1495.3007-.1486.4686.0009.1679.0546.3313.1535.4671.099.1357.2381.2368.3977.289l.763.247c.1589.0534.3033.1427.422.261.1182.1183.2067.2629.258.422l.253.774c.0548.1565.1568.2921.292.388Z"/>
        </svg>
        <h1 className="text-2xl text-white font-thin">Previous chat</h1>
        <div className="w-full backdrop-blur-sm rounded-2xl flex flex-col justify-center items-center py-2 bg-white bg-opacity-20 gap-2 px-2">
        <motion.button onClick={createChat} initial={{ scale: 1 }} whileHover={{scale:1.1}} className="w-1/2 text-white h-10 hover:bg-opacity-20 rounded-3xl bg-white bg-opacity-40 ">New chat</motion.button>
        {previousChats.map((chat, index) => (
          <motion.button 
            key={index} 
            initial={{ scale: 1 }} 
            whileHover={{ scale: 1.1 }} 
            className="w-full hover:bg-opacity-20 py-2 rounded-3xl bg-white bg-opacity-40 flex flex-grow px-2 text-center text-white"
            onClick={() => loadChat(chat)}
          >
            {chat.title}
          </motion.button>
        ))}

        
        </div>
      </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5, delay: 1 } }} viewport={{ once: true }}
         className="bg-white bg-opacity-20 w-[90%] h-full flex flex-col justify-start items-center">
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
        </motion.div>
      </div>
    </div>
    </AnimatePresence>
  );
}

export default App;
