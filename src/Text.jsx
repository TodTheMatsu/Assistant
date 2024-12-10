import { motion } from "motion/react"
function Text({ result }) {
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
    return (<>
    <div className="inline-flex bg-white bg-opacity-20 rounded-2xl pb-2 px-2"><motion.p className="text-3xl font-thin text-white">{renderText(result)}</motion.p></div>
    </>)
    } 
export default Text