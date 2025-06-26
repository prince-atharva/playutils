"use client";

import { signOut } from "next-auth/react";
import AnimatedBackground from "../../components/AnimatedBackground";
import FeaturedUtilityCard from "../../components/FeaturedUtilityCard";
import { featuredUtils } from "@/utils/featured";
import { FiZap, FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoggedIn } = useAuth();

  const userImage = user?.image || "https://ui-avatars.com/api/?name=User";
  const userName = user?.name || user?.email || "User";
  const userEmail = user?.email || "user@example.com";

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 antialiased overflow-x-hidden">
      <AnimatedBackground />

      <header className="relative z-20 w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiZap className="w-10 h-10 text-blue-500 animate-pulse drop-shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75"></div>
          </div>
          <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 drop-shadow-lg tracking-tight">
            PlayUtils
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">
        <section className="w-full max-w-3xl mx-auto mb-12">
          <motion.div
            className="bg-gray-900/80 rounded-2xl shadow-xl p-8 flex flex-col items-center"
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
          >
            <img
              src={userImage}
              alt={userName}
              className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg mb-4"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white drop-shadow-xl text-center">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {userName}
              </span>
              !
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto mt-2 text-center">
              <span className="block font-medium text-blue-300">
                {userEmail}
              </span>
              Here is your personalized dashboard. Access your developer utilities below and boost your productivity!
            </p>
          </motion.div>
        </section>

        <section className="w-full max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            animate="visible"
          >
            {featuredUtils.map((util, idx) => (
              <motion.div
                key={idx}
                variants={{
                  visible: { opacity: 1, y: 0 },
                }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              >
                <FeaturedUtilityCard util={util} isLoggedIn={isLoggedIn} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="relative z-20 w-full py-6 px-6 flex items-center justify-center text-gray-400 text-sm mt-auto">
        &copy; {new Date().getFullYear()} PlayUtils. All rights reserved.
      </footer>

      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
        }
        .animate-float1 { animation: float1 8s ease-in-out infinite; }
        .animate-float2 { animation: float2 10s ease-in-out infinite; }
        .animate-float3 { animation: float3 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}