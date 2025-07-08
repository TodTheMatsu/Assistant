import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const InputArea = ({
  inputText,
  handleChange,
  handlePaste,
  fetchAIResponse,
  loading,
  retryAttempt,
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
  dropdownRef2
}) => {
  return (
    <div className="w-full flex flex-col justify-center items-center py-5">
      <form className="w-full flex justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="bg-white bg-opacity-20 rounded-2xl border-2 border-transparent focus-within:border-blue-500 focus-within:shadow-2xl focus-within:shadow-blue-500/20 transition-all duration-300">
            <div className="relative">
              <motion.textarea
                ref={inputRef}
                value={inputText}
                onChange={handleChange}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    fetchAIResponse(e);
                  }
                }}
                placeholder="Enter text or paste images/code..."
                rows={inputText.split('\n').length > 3 ? Math.min(inputText.split('\n').length, 8) : 3}
                initial={{ boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }}
                transition={{ duration: 0.2, ease: "linear" }}
                className="w-full bg-transparent text-left text-xl px-6 py-4 text-white rounded-t-2xl focus:outline-none placeholder:text-lg placeholder:text-white placeholder:text-opacity-50 resize-none overflow-y-auto leading-relaxed"
                style={{ 
                  minHeight: '60px', 
                  maxHeight: '300px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
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
                
                {/* Tools Dropdown */}
                <div className="relative" ref={dropdownRef2}>
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
                        className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-black/90 backdrop-blur-md border border-white/30 rounded-xl shadow-lg overflow-hidden z-50"
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
                    <span className="text-sm font-medium">
                      {retryAttempt > 0 ? `Retrying... (${retryAttempt + 1}/3)` : 'Sending...'}
                    </span>
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
  );
};

export default InputArea;
