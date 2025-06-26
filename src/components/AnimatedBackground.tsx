"use client";

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/20 rounded-full filter blur-3xl animate-float1"></div>
    <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-900/20 rounded-full filter blur-3xl animate-float2"></div>
    <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-cyan-900/20 rounded-full filter blur-3xl animate-float3"></div>
  </div>
);

export default AnimatedBackground; 