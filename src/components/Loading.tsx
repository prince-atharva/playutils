import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
      <motion.div
        className="flex flex-col items-center justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-500/20 blur-2xl animate-pulse" />
          <div className="w-16 h-16 border-t-4 border-b-4 border-cyan-400 rounded-full animate-spin shadow-lg" style={{ boxShadow: '0 0 32px 4px #22d3ee55' }}></div>
        </div>
        <div className="w-32 h-6 rounded-full bg-gradient-to-r from-cyan-500/40 to-blue-500/40 animate-pulse flex items-center justify-center">
          <span className="text-cyan-200 font-semibold text-lg tracking-wide animate-shimmer bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-[length:200%_100%] bg-clip-text text-transparent">Loading...</span>
        </div>
      </motion.div>
    </div>
  );
} 