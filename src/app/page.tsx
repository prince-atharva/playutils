"use client";

import { FiArrowRight, FiCloud, FiMail, FiLock, FiCode, FiDatabase, FiCpu, FiZap, FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const featuredUtils = [
  {
    title: "Cloud Storage",
    description: "S3, R2, and GCS integrations with drag-and-drop UI",
    icon: <FiCloud className="w-8 h-8" />,
    gradient: "from-blue-600 to-indigo-600"
  },
  {
    title: "Email API",
    description: "Send transactional emails with built-in templates",
    icon: <FiMail className="w-8 h-8" />,
    gradient: "from-rose-600 to-pink-600"
  },
  {
    title: "Auth Toolkit",
    description: "OTP, JWT, and session management",
    icon: <FiLock className="w-8 h-8" />,
    gradient: "from-emerald-600 to-teal-600"
  },
  {
    title: "Code Gen AI",
    description: "AI-powered code snippets and transformations",
    icon: <FiCode className="w-8 h-8" />,
    gradient: "from-purple-600 to-violet-600"
  },
  {
    title: "Data Utilities",
    description: "CSV/JSON transformers and validators",
    icon: <FiDatabase className="w-8 h-8" />,
    gradient: "from-amber-600 to-orange-600"
  },
  {
    title: "System Tools",
    description: "Process management and automation",
    icon: <FiCpu className="w-8 h-8" />,
    gradient: "from-cyan-600 to-sky-600"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 antialiased overflow-x-hidden flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/20 rounded-full filter blur-3xl animate-float1"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-900/20 rounded-full filter blur-3xl animate-float2"></div>
        <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-cyan-900/20 rounded-full filter blur-3xl animate-float3"></div>
      </div>

      {/* Main Content */}
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
          {/* Login Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-all shadow"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
            <button 
              className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all shadow"
            >
              <FiGithub className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>

        {/* Utilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredUtils.map((util, idx) => (
            <div 
              key={idx} 
              className="relative h-full bg-gray-900/50 rounded-2xl p-8 border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-blue-900/20 to-purple-900/20"></div>
              <div className="absolute -right-10 -top-10 bg-blue-500/10 w-32 h-32 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 bg-purple-500/10 w-32 h-32 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${util.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  {util.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">{util.title}</h3>
                <p className="text-gray-400 mb-6">{util.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Animation styles */}
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