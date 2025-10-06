import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [messageSent, setMessageSent] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // Parallax effects for the hero title
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

  // Handle fake message send
  const handleSendMessage = () => {
    if (messageSent) return;
    
    setMessageSent(true);
    
    // Show thinking after a brief delay
    setTimeout(() => setShowThinking(true), 800);
    
    // Show response after thinking
    setTimeout(() => setShowResponse(true), 2500);
  };

  // Track mouse position for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-dark-charcoal text-light-beige overflow-x-hidden snap-y snap-mandatory overflow-scroll">

      {/* Navigation Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
  className="fixed top-4 left-0 right-0 px-0 sm:px-4 md:px-12 lg:px-24 z-50"
      >
        <nav className="mx-auto w-fit inline-flex items-center gap-6 py-4 px-6 bg-dark-charcoal/50 backdrop-blur-xl rounded-2xl border border-sage/20 shadow-lg">

          {/* Navigation Links */}
          <div className="flex items-center flex-row gap-4">
            {[
              { label: 'About', href: '#about' },
              { label: 'Features', href: '#features' },
              { label: 'Legal', href: '#legal' },
              { label: 'Contact', href: '#contact' },
            ].map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-sm px-2 text-light-beige/70 hover:text-light-beige transition-colors duration-200"
                whileHover={{ y: -2 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>
        </nav>
      </motion.header>


      {/* Hero Section - Massive Brand Name */}
      <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-24 relative snap-center">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ 
            fontSize: 'clamp(4rem, 20vw, 200rem)',
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
          }}
          className="font-thin leading-none tracking-tight relative z-10"
        >
          Assistant
        </motion.h1>
      </section>

      {/* Section 1 - Introduction */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 relative snap-center">
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-thin mb-8"
              whileInView={{ 
                backgroundPosition: ["0% 50%", "100% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              style={{
                background: "linear-gradient(90deg, #e8d7c3, #6b7f6e, #e8d7c3)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI-powered conversations
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-light-beige/70 font-light leading-relaxed"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              Experience the future of interaction. Get instant responses, creative solutions, 
              and intelligent insights powered by advanced AI technology.
            </motion.p>
          </motion.div>

          {/* Right side - AI Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative"
          >

            {/* Interactive Chat mockup - matching actual app style */}
            <div className="space-y-4 backdrop-blur-sm  rounded-2xl p-6 ">

              {/* User message */}
              {messageSent && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="inline-flex rounded-2xl py-2 px-2 max-w-[80%] backdrop-blur-xl border-2 border-sage border-opacity-30 shadow-xl bg-dark-gray bg-opacity-50">
                    <p className="font-thin text-light-beige text-xl px-2">What can you help me with?</p>
                  </div>
                </motion.div>
              )}

              {/* AI thinking animation */}
              {showThinking && !showResponse && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="w-full py-2 px-2">
                    <div className="space-y-3">
                      {[0, 1, 2, 3, 4].map((index) => {
                        const widthPercentages = [65, 45, 70, 55, 50];
                        return (
                          <motion.div
                            key={index}
                            className="h-4 bg-light-beige rounded-full"
                            style={{ width: `${widthPercentages[index]}%` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.25, 0] }}
                            transition={{ 
                              duration: 2,
                              delay: index * 0.4,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: "easeInOut"
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI response with thought process */}
              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="w-full">
                    <div className="inline-flex rounded-2xl py-2 px-2 w-full">
                      <div className="font-thin text-light-beige text-xl w-full">
                

                        {/* Response Content */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <p className="mb-2">I can assist you with a wide range of tasks including:</p>
                          <ul className="list-disc pl-5 mb-2 text-light-beige/90">
                            <li className="mb-1">Answering questions and providing information</li>
                            <li className="mb-1">Writing and editing content</li>
                            <li className="mb-1">Analyzing documents and images</li>
                          </ul>
                          <p className="mt-3">
                            Feel free to ask me anything! 🚀
                          </p>
                        </motion.div>
                                {/* Thought Process Section */}
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.5 }}
                          className="mb-4 pb-4 border-b border-sage/20"
                        >
                          <div className="flex items-center space-x-2 text-sm text-light-beige/70 mb-2">
                            <span className="font-medium">💭 Thought Process</span>
                          </div>
                          <div className="bg-sage/5 rounded-lg p-3 border border-sage/10">
                            <p className="text-sm text-light-beige/80 italic">
                              The user is asking about my capabilities. I should provide a clear, 
                              comprehensive overview of the main areas where I can assist.
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
              {/* Input area - always visible */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative"
              >
                <div className="bg-dark-gray/50 backdrop-blur-xl border-2 border-sage/30 rounded-2xl p-3 flex items-center space-x-3">
                  <input
                    type="text"
                    value={messageSent ? "" : "What can you help me with?"}
                    readOnly
                    placeholder={messageSent ? "Message sent..." : ""}
                    className="flex-1 bg-transparent text-light-beige placeholder:text-light-beige/40 text-lg font-thin focus:outline-none cursor-default"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={messageSent}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                      messageSent 
                        ? 'bg-sage/10 cursor-not-allowed opacity-50' 
                        : 'bg-sage/20 hover:bg-sage/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
                {!messageSent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute -bottom-8 left-0 text-xs text-sage/60 flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>Press send!</span>
                  </motion.div>
                )}
              </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 2 - Features */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 snap-center">
        <div className="max-w-5xl w-full">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: "Lightning Fast",
                description: "Get instant responses powered by advanced AI technology for real-time conversations.",
                delay: 0
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                title: "File Support",
                description: "Upload images, documents, and code files for comprehensive AI analysis.",
                delay: 0.2
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: "Chat History",
                description: "Never lose a conversation. Access your complete chat history anytime.",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                style={{ perspective: 1000 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-sage/20 rounded-xl flex items-center justify-center mb-4"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    backgroundColor: "rgba(107,127,110,0.3)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-light mb-3">{feature.title}</h3>
                <p className="text-light-beige/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - CTA */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 relative snap-center">
        <div className="max-w-6xl w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center"
          >
            {/* Main Headline */}
            <motion.h2 
              className="text-6xl md:text-8xl lg:text-9xl font-thin mb-8 leading-none"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              Start creating
            </motion.h2>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-2xl md:text-3xl text-light-beige/70 font-light mb-4  max-w-4xl mx-auto"
            >
              Experience intelligent conversations that adapt to your needs
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false, amount: 0.3 }}
              className="mb-4"
            >
              <motion.button
                onClick={() => navigate('/app')}
                className="px-20 py-7 bg-sage text-dark-charcoal rounded-md text-2xl md:text-3xl font-light overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "#7a9080"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative px-2 z-10">Launch Assistant</span>
              </motion.button>
            </motion.div>

            {/* Simple Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-light-beige/50 text-base"
            >
              No account needed
            </motion.p>
          </motion.div>
        </div>

      </section>

      {/* Footer */}
      <footer className="py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-light-beige/30">
          <div className="mb-4 md:mb-0">
            © 2025 Assistant
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-light-beige/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-light-beige/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-light-beige/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
