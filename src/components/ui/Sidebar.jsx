import React from 'react';
import { motion } from 'motion/react';

const Sidebar = ({ 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  previousChats, 
  createChat, 
  loadChat, 
  deleteChat 
}) => {
  return (
    <>
      {/* Sidebar Toggle Button */}
      <motion.button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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
          <div className="w-full mb-4 flex-shrink-0">
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
    </>
  );
};

export default Sidebar;
