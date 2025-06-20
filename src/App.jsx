import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence, delay } from "motion/react";
import Text from "./Text.jsx";

function App() {
  const [inputText, setInput] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [history, setHistory] = useState([]); 
  const [previousChats, setPreviousChats] = useState([]);
  const [onExistingChat, setOnExistingChat] = useState(false);
  const [currentChatIndex, setCurrentChatIndex] = useState(-1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
  const searchModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    tools: [{ googleSearch: {} }]
  });
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter supported file types
    const supportedFiles = files.filter(file => {
      const type = file.type;
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      return (
        // Images
        type.startsWith('image/') ||
        // Documents
        type === 'application/pdf' ||
        type === 'application/msword' ||
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        type === 'application/vnd.ms-excel' ||
        type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        type === 'application/vnd.ms-powerpoint' ||
        type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        // Text and code files
        type === 'text/plain' ||
        type === 'text/csv' ||
        type === 'application/json' ||
        type === 'text/javascript' ||
        type === 'text/html' ||
        type === 'text/css' ||
        type === 'application/xml' ||
        type === 'text/xml' ||
        // Code file extensions
        ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sql', 'sh', 'bash', 'yml', 'yaml', 'toml', 'ini', 'env', 'md', 'txt'].includes(extension)
      );
    });
    
    // Create preview data for the selected files
    const filePreviewPromises = supportedFiles.map(file => {
      return new Promise((resolve) => {
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
          // For images, create preview URL
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file,
              preview: e.target.result,
              name: file.name,
              size: file.size,
              type: 'image'
            });
          };
          reader.readAsDataURL(file);
        } else {
          // For other files, just store file info
          resolve({
            file,
            preview: null,
            name: file.name,
            size: file.size,
            type: getFileType(file)
          });
        }
      });
    });

    Promise.all(filePreviewPromises).then(fileData => {
      setSelectedFiles(prev => [...prev, ...fileData]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (file) => {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.includes('word') || extension === 'docx') return 'document';
    if (type.includes('excel') || type.includes('spreadsheet') || extension === 'xlsx' || extension === 'csv') return 'spreadsheet';
    if (type.includes('powerpoint') || type.includes('presentation') || extension === 'pptx') return 'presentation';
    if (type === 'application/json' || extension === 'json') return 'json';
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala'].includes(extension)) return 'code';
    if (['html', 'css', 'xml', 'svg'].includes(extension)) return 'markup';
    if (['yml', 'yaml', 'toml', 'ini', 'env'].includes(extension)) return 'config';
    if (['md', 'txt'].includes(extension)) return 'text';
    if (['sql', 'sh', 'bash'].includes(extension)) return 'script';
    return 'file';
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
      case 'text':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'spreadsheet':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        );
      case 'code':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'json':
      case 'config':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H17a1 1 0 010-2z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const blurDecorator = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
    exit: { opacity: 0 },
  };

  const fetchAIResponse = async (e) => {
    e.preventDefault();
    
    // Don't start a new request if already loading
    if (loading) return;
    
    // Store inputs immediately to avoid timing issues with state updates
    const requestInput = inputText;
    const requestFiles = [...selectedFiles];
    
    // Don't send if there's no content (no text and no files)
    if (!requestInput.trim() && requestFiles.length === 0) return;
    
    console.log('Sending request with:', { 
      text: requestInput, 
      filesCount: requestFiles.length 
    });
    
    setLoading(true);
    
    // Prepare user message parts
    const messageParts = [];
    
    // Only add text part if there's actual text content
    if (requestInput.trim()) {
      messageParts.push({ text: requestInput });
    }
    
    // Process files and add to message parts
    for (const fileData of requestFiles) {
      if (fileData.type === 'image') {
        // For images, convert to the format expected by Gemini
        const base64Data = fileData.preview.split(',')[1]; // Remove data:image/...;base64, prefix
        messageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: fileData.file.type
          }
        });
      } else {
        // For non-image files, read content and add as text
        try {
          const fileContent = await readFileContent(fileData.file);
          messageParts.push({
            text: `\n\n[File: ${fileData.name}]\n${fileContent}`
          });
        } catch (error) {
          console.error(`Error reading file ${fileData.name}:`, error);
          messageParts.push({
            text: `\n\n[File: ${fileData.name} - Error reading file content]`
          });
        }
      }
    }
    
    const userMessage = { role: "user", parts: messageParts };
    
    // Capture the current chat context at the time of the request
    const requestChatContext = {
      isExistingChat: onExistingChat,
      chatIndex: currentChatIndex,
      currentHistory: [...history],
      requestId: Date.now() + Math.random(), // Unique identifier for this request
      // For new chats, capture the current history length to distinguish between different new chats
      historyLength: history.length
    };
    
    try {
      setInput("");
      setSelectedFiles([]); // Clear files after sending
      
      // Add user message to history immediately for display
      const historyWithUserMessage = [...requestChatContext.currentHistory, userMessage];
      setHistory(historyWithUserMessage);
      
      // Use search model if useSearch is enabled, otherwise use regular model
      const selectedModel = useSearch ? searchModel : model;
      const chat = selectedModel.startChat({ history: requestChatContext.currentHistory });
      const result = await chat.sendMessage(messageParts);
      const aiMessage = { role: "model", parts: [{ text: result.response.text() }] };
      
      // Check if we're still on the same chat before applying the response
      // This prevents the bug where switching chats during AI response causes wrong chat to be updated
      const isStillOnSameChat = 
        requestChatContext.isExistingChat === onExistingChat && 
        requestChatContext.chatIndex === currentChatIndex &&
        // For new chats, also check if we're still in the same conversation by comparing history length
        (!requestChatContext.isExistingChat ? requestChatContext.historyLength === history.length - 1 : true);
      
      // For new chats, if we're still on a new chat (not switched to an existing one), we should update
      const shouldUpdateNewChat = !requestChatContext.isExistingChat && !onExistingChat;
      
      const updatedHistory = [...historyWithUserMessage, aiMessage];
      
      // Always update the appropriate chat in previousChats based on the original context
      if (requestChatContext.isExistingChat && requestChatContext.chatIndex !== -1) {
        // Update existing chat
        setPreviousChats((prev) => 
          prev.map((chat, index) => 
            index === requestChatContext.chatIndex 
              ? { ...chat, history: updatedHistory }
              : chat
          )
        );
        
        // Only update current history if we're still viewing the same chat
        if (isStillOnSameChat) {
          setHistory(updatedHistory);
        }
      } else {
        // This is a new conversation, save it automatically
        const newChatIndex = previousChats.length;
        setPreviousChats((prev) => [...prev, { history: updatedHistory, title: "..." }]);
        
        // Update current chat state if we haven't switched to an existing chat
        if (shouldUpdateNewChat || isStillOnSameChat) {
          setOnExistingChat(true);
          setCurrentChatIndex(newChatIndex);
          setHistory(updatedHistory);
        }
        
        // Generate title asynchronously
        setTimeout(async () => {
          try {
            const title = await createTitle(updatedHistory);
            setPreviousChats((prev) =>
              prev.map((chat, index) =>
                index === newChatIndex ? { ...chat, title } : chat
              )
            );
          } catch (error) {
            console.error("Error generating title:", error);
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      // If we're still on the same chat, remove the user message that was added
      if ((requestChatContext.isExistingChat === onExistingChat && 
          requestChatContext.chatIndex === currentChatIndex) ||
          (!requestChatContext.isExistingChat && !onExistingChat)) {
        setHistory(requestChatContext.currentHistory);
      }
    } finally {
      // Only clear loading if we're still on the same chat or if it's a new chat that should be updated
      if ((requestChatContext.isExistingChat === onExistingChat && 
          requestChatContext.chatIndex === currentChatIndex) ||
          (!requestChatContext.isExistingChat && !onExistingChat)) {
        setLoading(false);
      }
    }
  };

  const loadChat = (chat, index) => {
    // Clear any ongoing loading state when switching chats
    setLoading(false);
    setHistory(chat.history);
    setInput("");
    setSelectedFiles([]);
    setOnExistingChat(true);
    setCurrentChatIndex(index);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const createTitle = async (chatHistory) => {
    try {
      const prompt = "Generate a short title for the following chat history, you will only give one title and nothing else: " + JSON.stringify(chatHistory);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error generating AI content:", error);
      return "Untitled Chat";
    }
  };
  

  const createChat = async () => {
    // Clear any ongoing loading state when creating a new chat
    setLoading(false);
    setOnExistingChat(false);
    setCurrentChatIndex(-1);
    setHistory([]);
    setInput("");
    setSelectedFiles([]);
  };

  const deleteChat = (indexToDelete, e) => {
    e.stopPropagation(); // Prevent triggering the loadChat function
    
    setPreviousChats((prev) => prev.filter((_, index) => index !== indexToDelete));
    
    // If we're currently viewing the chat being deleted, start a new chat
    if (currentChatIndex === indexToDelete) {
      setOnExistingChat(false);
      setCurrentChatIndex(-1);
      setHistory([]);
      setInput("");
      setSelectedFiles([]);
    } else if (currentChatIndex > indexToDelete) {
      // If we're viewing a chat that comes after the deleted one, adjust the index
      setCurrentChatIndex(currentChatIndex - 1);
    }
  };
  
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = reject;
      
      // Read different file types appropriately
      if (file.type.startsWith('text/') || 
          file.name.endsWith('.txt') || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.json') || 
          file.name.endsWith('.js') || 
          file.name.endsWith('.jsx') || 
          file.name.endsWith('.ts') || 
          file.name.endsWith('.tsx') || 
          file.name.endsWith('.py') || 
          file.name.endsWith('.java') || 
          file.name.endsWith('.cpp') || 
          file.name.endsWith('.c') || 
          file.name.endsWith('.h') || 
          file.name.endsWith('.css') || 
          file.name.endsWith('.html') || 
          file.name.endsWith('.xml') || 
          file.name.endsWith('.yaml') || 
          file.name.endsWith('.yml') || 
          file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        // For binary files like PDFs, read as text anyway and let the AI know it's binary
        reader.readAsText(file);
      }
    });
  };

  useEffect(() => {
    if (resultsRef.current) {
      setTimeout(() => {
        const { scrollHeight, clientHeight } = resultsRef.current;
        resultsRef.current.scrollTop = scrollHeight - clientHeight;
      }, 500); // Add a small delay to ensure the content is rendered
    }
  }, [history]);

  // Effect to refocus input after first message is sent
  useEffect(() => {
    if (history.length > 0 && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100); // Small delay to ensure the input field is rendered
    }
  }, [history.length]);
  

  return (
  <AnimatePresence>
    <div className="w-screen h-screen bg-black">
      <div className="w-screen h-screen flex flex-row justify-center items-end">
      {/* Toggle Button */}
      <motion.button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {sidebarCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </motion.button>

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? "0px" : "280px",
          opacity: sidebarCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-r-2 border-white border-opacity-30 bg-opacity-10 h-full flex flex-col justify-start items-center overflow-hidden"
      >
        <div className="w-full flex flex-col items-center pt-16 px-4 h-full">
          {/* Logo/Icon */}
          <div className="mb-4 flex-shrink-0">
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 stroke-white" viewBox="0 0 20 20">
              <motion.path 
                initial={{ pathLength: 0, fill: "none" }} 
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                d="M7.39804 12.8085c.17624.1243.38672.1909.60239.1905.2159.0002.42643-.0673.602-.193.1775-.1305.31221-.3108.387-.518l.447-1.373c.11443-.3443.30748-.6572.56387-.9139.2563-.25674.569-.45021.9131-.5651l1.391-.45101c.152-.05435.2892-.14315.4011-.25944s.1953-.2569.2437-.41082c.0485-.15393.0606-.31697.0355-.47637-.0251-.15939-.0868-.3108-.1803-.44236-.1341-.18593-.325-.32317-.544-.391l-1.375-.447c-.3445-.11423-.6576-.3072-.91453-.56359-.25691-.25638-.45052-.56913-.56544-.91341l-.452-1.388c-.0723-.20231-.20582-.37707-.382-.5-.13266-.09373-.28536-.15521-.44595-.17956-.16059-.02434-.32465-.01088-.47912.03931-.15448.0502-.29511.13575-.41072.24985-.1156.11409-.20299.25359-.25521.4074l-.457 1.4c-.11459.33482-.30376.63923-.55321.89025-.24946.25101-.55269.44207-.88679.55875l-1.391.448c-.15178.05439-.28891.14317-.40066.25938-.11176.11622-.19511.25672-.24353.4105-.04842.15379-.0606.31669-.03559.47597.02502.15928.08655.31061.17978.44215.12784.17945.30862.31442.517.386l1.374.44499c.44011.14649.82656.42083 1.11.78801.16242.2106.28787.4473.371.7l.452 1.391c.07203.2033.20536.3792.38161.5035Zm6.13726 4.0425c.136.0962.2984.1479.465.148.1651.0001.3261-.0509.461-.146.1395-.0985.2445-.2384.3-.4l.248-.762c.0532-.1584.1422-.3025.26-.421.1174-.1185.2614-.2073.42-.259l.772-.252c.1577-.0545.2944-.1569.391-.293.0734-.103.1213-.2219.1398-.347.0185-.1251.0071-.2528-.0333-.3727-.0404-.1198-.1087-.2283-.1991-.3167-.0905-.0884-.2006-.154-.3214-.1916l-.764-.249c-.1581-.0525-.3019-.1412-.4199-.2588-.118-.1177-.2071-.2612-.2601-.4192l-.252-.773c-.0537-.1578-.1563-.2944-.293-.39-.102-.0729-.2198-.1209-.3437-.1399-.124-.0191-.2507-.0087-.3699.03931-.1193.0389-.2277.1053-.3165.1939-.0888.0885-.1556.1967-.1949.3158l-.247.762c-.0523.1577-.1398.3013-.256.42-.1147.1165-.2546.2051-.409.259l-.773.252c-.159.0539-.2971.1565-.3946.2933-.0975.1367-.1495.3007-.1486.4686.0009.1679.0546.3313.1535.4671.099.1357.2381.2368.3977.289l.763.247c.1589.0534.3033.1427.422.261.1182.1183.2067.2629.258.422l.253.774c.0548.1565.1568.2921.292.388Z"/>
            </svg>
          </div>
          
          {/* New Chat Button */}
          <div className="w-full mb-6 flex-shrink-0">
            <motion.button 
              onClick={createChat} 
              initial={{ scale: 1 }} 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-white py-3 px-4 hover:bg-opacity-20 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 transition-all duration-200"
            >
              <span className="text-sm font-medium">+ New Chat</span>
            </motion.button>
          </div>
          
          <h1 className="text-lg text-white font-thin mb-6 whitespace-nowrap flex-shrink-0">Chat History</h1>
          
          {/* Chat History */}
          <div className="w-full flex flex-col gap-2 flex-1 overflow-x-hidden overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pr-1">
            {previousChats.slice().reverse().map((chat, reverseIndex) => {
              const originalIndex = previousChats.length - 1 - reverseIndex;
              return (
                <motion.div 
                  key={originalIndex}
                  className="relative group flex-shrink-0"
                  initial={{ scale: 1 }} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <button 
                    className="w-full hover:bg-white hover:bg-opacity-10 py-3 px-3 pr-10 rounded-xl bg-white bg-opacity-5 text-white text-left transition-all duration-200"
                    onClick={() => loadChat(chat, originalIndex)}
                  >
                    <p className="text-sm truncate">{chat.title}</p>
                  </button>
                  
                  {/* Delete Button */}
                  <motion.button
                    onClick={(e) => deleteChat(originalIndex, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:bg-opacity-20 p-1.5 rounded-md transition-all duration-200 flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 text-red-400 hover:text-red-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
          
          {/* User Account Section */}
          <div className="w-full mt-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10">
              {/* User Avatar Placeholder */}
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">User</p>
                <p className="text-xs text-white text-opacity-60 truncate">user@example.com</p>
              </div>
              
              {/* Settings/Options Button */}
              <motion.button 
                className="p-1 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors duration-200 flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 text-white text-opacity-60 hover:text-opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col justify-start items-center bg-white bg-opacity-5 backdrop-blur-3xl shadow-[inset_0px_30px_600px_rgba(255,255,255,.01)]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }} 
          className="z-10 flex-grow w-full max-w-4xl h-full flex flex-col justify-start items-center"
        >
          <motion.div
            ref={resultsRef}
            className="w-full h-full flex flex-col justify-start items-start rounded-xl overflow-auto space-y-5 px-10 py-10 scrollbar
             scrollbar-thumb-gray-400 scrollbar-corner-white overflow-x-hidden scroll-smooth">
            {history.length === 0 && !loading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full flex flex-col justify-center items-center text-center"
              >
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-6xl md:text-8xl font-thin text-white mb-8 relative flex items-center justify-center"
                >
                  Assistant
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: [0, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.4,
                      scale: { times: [0, 0.7, 1], duration: 1.5 }
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="absolute -right-16 md:-right-20 top-[20%] -translate-y-1/2"
                  >
                    <motion.svg 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-16 h-16 md:w-20 md:h-20 stroke-white scale-x-[-1] drop-shadow-lg" 
                      viewBox="0 0 20 20"
                      animate={{
                        filter: [
                          "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
                          "drop-shadow(0 0 15px rgba(255,255,255,0.7))",
                          "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <motion.path 
                        initial={{ pathLength: 0, fill: "none", opacity: 0 }} 
                        animate={{ 
                          pathLength: 1, 
                          opacity: [0, 1, 0.9, 1]
                        }}
                        transition={{ 
                          pathLength: { duration: 1.5, delay: 0.5 },
                          opacity: { 
                            duration: 4, 
                            repeat: Infinity, 
                            repeatType: "reverse",
                            delay: 2
                          }
                        }}
                        d="M7.39804 12.8085c.17624.1243.38672.1909.60239.1905.2159.0002.42643-.0673.602-.193.1775-.1305.31221-.3108.387-.518l.447-1.373c.11443-.3443.30748-.6572.56387-.9139.2563-.25674.569-.45021.9131-.5651l1.391-.45101c.152-.05435.2892-.14315.4011-.25944s.1953-.2569.2437-.41082c.0485-.15393.0606-.31697.0355-.47637-.0251-.15939-.0868-.3108-.1803-.44236-.1341-.18593-.325-.32317-.544-.391l-1.375-.447c-.3445-.11423-.6576-.3072-.91453-.56359-.25691-.25638-.45052-.56913-.56544-.91341l-.452-1.388c-.0723-.20231-.20582-.37707-.382-.5-.13266-.09373-.28536-.15521-.44595-.17956-.16059-.02434-.32465-.01088-.47912.03931-.15448.0502-.29511.13575-.41072.24985-.1156.11409-.20299.25359-.25521.4074l-.457 1.4c-.11459.33482-.30376.63923-.55321.89025-.24946.25101-.55269.44207-.88679.55875l-1.391.448c-.15178.05439-.28891.14317-.40066.25938-.11176.11622-.19511.25672-.24353.4105-.04842.15379-.0606.31669-.03559.47597.02502.15928.08655.31061.17978.44215.12784.17945.30862.31442.517.386l1.374.44499c.44011.14649.82656.42083 1.11.78801.16242.2106.28787.4473.371.7l.452 1.391c.07203.2033.20536.3792.38161.5035Zm6.13726 4.0425c.136.0962.2984.1479.465.148.1651.0001.3261-.0509.461-.146.1395-.0985.2445-.2384.3-.4l.248-.762c.0532-.1584.1422-.3025.26-.421.1174-.1185.2614-.2073.42-.259l.772-.252c.1577-.0545.2944-.1569.391-.293.0734-.103.1213-.2219.1398-.347.0185-.1251.0071-.2528-.0333-.3727-.0404-.1198-.1087-.2283-.1991-.3167-.0905-.0884-.2006-.154-.3214-.1916l-.764-.249c-.1581-.0525-.3019-.1412-.4199-.2588-.118-.1177-.2071-.2612-.2601-.4192l-.252-.773c-.0537-.1578-.1563-.2944-.293-.39-.102-.0729-.2198-.1209-.3437-.1399-.124-.0191-.2507-.0087-.3699.03931-.1193.0389-.2277.1053-.3165.1939-.0888.0885-.1556.1967-.1949.3158l-.247.762c-.0523.1577-.1398.3013-.256.42-.1147.1165-.2546.2051-.409.259l-.773.252c-.159.0539-.2971.1565-.3946.2933-.0975.1367-.1495.3007-.1486.4686.0009.1679.0546.3313.1535.4671.099.1357.2381.2368.3977.289l.763.247c.1589.0534.3033.1427.422.261.1182.1183.2067.2629.258.422l.253.774c.0548.1565.1568.2921.292.388Z"/>
                    </motion.svg>
                  </motion.div>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="space-y-3 mb-12"
                >
                  <p className="text-xl text-white text-opacity-70 font-light">
                    Start a conversation by typing your message below
                  </p>
                  <p className="text-lg text-white text-opacity-50 font-light">
                    Ask anything, and I'll help you find the answers
                  </p>
                </motion.div>
                
                {/* Input field integrated into welcome screen */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="w-full flex flex-col justify-center items-center"
                >
                  <form
                    className="w-full flex justify-center items-center"
                  >
                    <div className="relative w-full max-w-2xl">
                      <div className="bg-white bg-opacity-20 rounded-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:shadow-2xl focus-within:shadow-blue-500/20 transition-all duration-300">
                        <motion.input
                          ref={inputRef}
                          type="text"
                          value={inputText}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              fetchAIResponse(e);
                            }
                          }}
                          placeholder="Enter text"
                          initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                          transition={{ duration: 0.2, ease: "linear" }}
                          className="w-full bg-transparent text-left text-xl px-6 py-4
                           text-white rounded-t-2xl focus:outline-none placeholder:text-lg placeholder:text-white placeholder:text-opacity-50"
                        />
                        
                        {/* File previews */}
                        {selectedFiles.length > 0 && (
                          <div className="px-6 py-3 border-t border-white/10">
                            <div className="flex flex-wrap gap-2">
                              {selectedFiles.map((fileData, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="relative group"
                                >
                                  {fileData.type === 'image' ? (
                                    <img
                                      src={fileData.preview}
                                      alt={fileData.name}
                                      className="w-16 h-16 object-cover rounded-lg border border-white/20"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/20 flex flex-col items-center justify-center p-2">
                                      <div className="text-white/70 mb-1">
                                        {getFileIcon(fileData.type)}
                                      </div>
                                      <div className="text-xs text-white/50 text-center truncate w-full">
                                        {fileData.name.split('.').pop()}
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                  {/* File name tooltip on hover */}
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {fileData.name}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Bottom section with buttons */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
                          {/* Left side controls */}
                          <div className="flex items-center space-x-3">
                            {/* Image upload button */}
                            <div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sql,.sh,.bash,.yml,.yaml,.toml,.ini,.env,.md,.html,.css,.xml,.svg"
                                multiple
                                onChange={handleFileSelect}
                                className="sr-only"
                                id="file-upload"
                              />
                              <motion.label
                                htmlFor="file-upload"
                                className="relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm overflow-hidden bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ isolation: 'isolate' }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                              </motion.label>
                            </div>
                            
                            {/* Search toggle button */}
                            <div>
                              <input
                                type="checkbox"
                                id="search-toggle"
                                checked={useSearch}
                                onChange={(e) => setUseSearch(e.target.checked)}
                                className="sr-only"
                              />
                              <motion.label 
                                htmlFor="search-toggle" 
                                className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                                  useSearch 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50' 
                                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ isolation: 'isolate' }}
                              >
                                {/* Icon */}
                                <motion.div
                                  className={`relative z-10 ${useSearch ? 'text-white' : 'text-white/70'}`}
                                  animate={{ rotate: useSearch ? 360 : 0 }}
                                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </motion.div>
                                
                                {/* Text */}
                                <span className="relative z-10 text-sm font-medium">
                                  Search The Web
                                </span>
                                
                                {/* Active indicator */}
                                {useSearch && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: -180 }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
                                    className="relative z-10 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                                  >
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </motion.div>
                                )}
                              </motion.label>
                            </div>
                          </div>
                          
                          {/* Send button */}
                          <motion.button
                            type="button"
                            onClick={fetchAIResponse}
                            disabled={loading || (!inputText.trim() && selectedFiles.length === 0)}
                            className={`relative flex items-center justify-center px-6 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                              loading || (!inputText.trim() && selectedFiles.length === 0)
                                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/40'
                            }`}
                            whileHover={loading || (!inputText.trim() && selectedFiles.length === 0) ? {} : { scale: 1.05 }}
                            whileTap={loading || (!inputText.trim() && selectedFiles.length === 0) ? {} : { scale: 0.95 }}
                            style={{ isolation: 'isolate' }}
                          >
                            {loading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 mr-2"
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </motion.div>
                                <span className="text-sm font-medium">Sending...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span className="text-sm font-medium">Send</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {history.map((entry, index) => (
                    <Text key={index} result={entry.parts[0].text} role={entry.role} index={index} />
                ))}
                {loading && <Text key="loading" result="Thinking..." role='model' loading={true}/>}
              </>
            )}
          </motion.div>
  
          {/* Only show bottom input when there are messages or loading */}
          {(history.length > 0 || loading) && (
            <div className="w-full flex flex-col justify-center items-center py-5">
              <form className="w-full flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <div className="bg-white bg-opacity-20 rounded-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:shadow-2xl focus-within:shadow-blue-500/20 transition-all duration-300">
                    <motion.input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          fetchAIResponse(e);
                        }
                      }}
                      placeholder="Enter text"
                      initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                      transition={{ duration: 0.2, ease: "linear" }}
                      className="w-full bg-transparent text-left text-xl px-6 py-4
                       text-white rounded-t-2xl focus:outline-none placeholder:text-lg placeholder:text-white placeholder:text-opacity-50"
                    />
                    
                    {/* File previews */}
                    {selectedFiles.length > 0 && (
                      <div className="px-6 py-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((fileData, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group"
                            >
                              {fileData.type === 'image' ? (
                                <img
                                  src={fileData.preview}
                                  alt={fileData.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-white/20"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/20 flex flex-col items-center justify-center p-2">
                                  <div className="text-white/70 mb-1">
                                    {getFileIcon(fileData.type)}
                                  </div>
                                  <div className="text-xs text-white/50 text-center truncate w-full">
                                    {fileData.name.split('.').pop()}
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                              {/* File name tooltip on hover */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {fileData.name}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom section with buttons */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
                      {/* Left side controls */}
                      <div className="flex items-center space-x-3">
                        {/* Image upload button */}
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sql,.sh,.bash,.yml,.yaml,.toml,.ini,.env,.md,.html,.css,.xml,.svg"
                            multiple
                            onChange={handleFileSelect}
                            className="sr-only"
                            id="file-upload-bottom"
                          />
                          <motion.label
                            htmlFor="file-upload-bottom"
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm overflow-hidden bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ isolation: 'isolate' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </motion.label>
                        </div>
                        
                        {/* Search toggle button */}
                        <div>
                          <input
                            type="checkbox"
                            id="search-toggle-bottom"
                            checked={useSearch}
                            onChange={(e) => setUseSearch(e.target.checked)}
                            className="sr-only"
                          />
                          <motion.label 
                            htmlFor="search-toggle-bottom" 
                            className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl cursor-pointer select-none transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                              useSearch 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50' 
                                : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ isolation: 'isolate' }}
                          >
                            {/* Icon */}
                            <motion.div
                              className={`relative z-10 ${useSearch ? 'text-white' : 'text-white/70'}`}
                              animate={{ rotate: useSearch ? 360 : 0 }}
                              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </motion.div>
                            
                            {/* Text */}
                            <span className="relative z-10 text-sm font-medium">
                              Search The Web
                            </span>
                            
                            {/* Active indicator */}
                            {useSearch && (
                              <motion.div
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
                                className="relative z-10 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                              >
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.label>
                        </div>
                      </div>
                      
                      {/* Send button */}
                      <motion.button
                        type="button"
                        onClick={fetchAIResponse}
                        disabled={loading || (!inputText.trim() && selectedFiles.length === 0)}
                        className={`relative flex items-center justify-center px-6 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm overflow-hidden ${
                          loading || (!inputText.trim() && selectedFiles.length === 0)
                            ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/40'
                        }`}
                        whileHover={loading || (!inputText.trim() && selectedFiles.length === 0) ? {} : { scale: 1.05 }}
                        whileTap={loading || (!inputText.trim() && selectedFiles.length === 0) ? {} : { scale: 0.95 }}
                        style={{ isolation: 'isolate' }}
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 mr-2"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </motion.div>
                            <span className="text-sm font-medium">Sending...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span className="text-sm font-medium">Send</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
    </AnimatePresence>
  );
}

export default App;
