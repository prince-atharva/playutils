import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      className="flex items-center justify-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
    </motion.div>
  );
} 