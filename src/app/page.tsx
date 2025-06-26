"use client";

import AnimatedBackground from "../components/AnimatedBackground";
import FeaturedUtilityCard from "../components/FeaturedUtilityCard";
import LoginButtons from "../components/LoginButtons";
import { featuredUtils } from "@/utils/featured";
import { FiZap } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 antialiased overflow-x-hidden flex flex-col">
      <AnimatedBackground />

      <main className="relative z-10 flex-1 py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <FiZap className="w-10 h-10 text-blue-500 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75"></div>
            </div>
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              PlayUtils
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Developer Utilities
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Powerful tools to supercharge your development workflow
          </p>
          <LoginButtons />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredUtils.map((util, idx) => (
            <FeaturedUtilityCard key={idx} util={util} />
          ))}
        </div>
      </main>

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