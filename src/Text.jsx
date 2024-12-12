import { motion } from "framer-motion"

function Text({ result, role }) {
  console.log(role)
  return (
    <motion.div initial={{height: 0}} animate={{height: "auto", transition: {duration: 0.2, ease:"linear"}}} className={`inline-flex backdrop-blur-xl  rounded-2xl pb-2 px-2 ${role === "model" ? "bg-blue-500 bg-opacity-60" : "bg-white bg-opacity-20"}`}>
      <motion.p initial={{opacity: 0}} animate={{opacity: 1, transition: {delay: 0.2, duration: .2}}}  className="text-3xl font-thin text-white">
        {result}
      </motion.p>
    </motion.div>
  );
}

export default Text;
