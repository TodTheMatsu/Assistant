import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const WelcomeScreen = ({
  inputText,
  handleChange,
  handlePaste,
  fetchAIResponse,
  loading,
  selectedFiles,
  handleFileSelect,
  removeFile,
  getFileIcon,
  dropdownOpen,
  setDropdownOpen,
  toggleMode,
  useSearch,
  openEditor,
  inputRef,
  fileInputRef,
  dropdownRef
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col w-1/2 items-center justify-center min-h-screen text-center px-4"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
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
        <form className="w-full flex justify-center items-center">
          <div className="relative w-full max-w-2xl">
            <div className="bg-white bg-opacity-20 rounded-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:shadow-2xl focus-within:shadow-blue-500/20 transition-all duration-300">
              <div className="relative">
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      fetchAIResponse(e);
                    }
                  }}
                  placeholder="Enter text or paste images"
                  initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                  transition={{ duration: 0.2, ease: "linear" }}
                  className={`w-full bg-transparent text-left text-xl px-6 py-4 text-white rounded-t-2xl focus:outline-none placeholder:text-lg placeholder:text-white placeholder:text-opacity-50 ${useSearch ? 'pr-32' : ''}`}
                />
              </div>
              
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
                  
                  {/* Tools Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm overflow-hidden bg-white/10 text-white/70 border border-white/30 hover:bg-white/20 hover:text-white/90 hover:border-white/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ isolation: 'isolate' }}
                    >
                      {/* Tools Icon */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      
                      {/* Text */}
                      <span className="text-sm font-medium">Tools</span>
                      
                      {/* Dropdown Arrow */}
                      <motion.svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-black/90 border-white/30 rounded-xl shadow-lg overflow-hidden z-10"
                          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                        >
                          {/* Search Toggle Item */}
                          <motion.button
                            type="button"
                            onClick={() => {
                              toggleMode('search');
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                              useSearch 
                                ? 'bg-blue-500/20 text-blue-200' 
                                : 'text-white/70 hover:bg-white/10 hover:text-white/90'
                            }`}
                            whileHover={{ backgroundColor: useSearch ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)' }}
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm font-medium">Search the Web</span>
                            {useSearch && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-blue-400 rounded-full ml-auto"
                              />
                            )}
                          </motion.button>

                          {/* Divider */}
                          <div className="h-px bg-white/20"></div>

                          {/* Open Editor Item */}
                          <motion.button
                            type="button"
                            onClick={() => {
                              openEditor();
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white/90 transition-all duration-200"
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-sm font-medium">Open Flowchart Editor</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Active Tool Indicator */}
                  <AnimatePresence>
                    {useSearch && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-400/50"
                      >
                        <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-200">Web Search Active</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
  );
};

export default WelcomeScreen;
