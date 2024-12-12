import { motion } from "framer-motion"

function Text({ result, role, loading }) {
  const delayTime = loading ? 0.5 : 0.2
  return (
    <div className={`w-full flex ${role === "user" ?  "justify-end" :  " justify-start"}`}>
    <motion.div initial={{height: 0, opacity:0}} animate={{height: "auto", opacity: 1, transition: {duration: 0.1, delay:delayTime, ease:"linear"}}}
     className={`inline-flex backdrop-blur-xl max-w-[80%] rounded-2xl pb-2 px-2 shadow-xl
     ${role === "model" ? "bg-blue-500 bg-opacity-60" : "bg-white bg-opacity-20"}`}>
      <motion.p initial={{opacity: 0}} animate={{opacity: 1, transition: {delay: delayTime+.2, duration: .1}}}  className="text-xl font-thin text-white">
        {result}
      </motion.p>
    </motion.div>
    </div>
  );
}

export default Text;
