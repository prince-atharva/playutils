"use client";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";
import { signIn } from "next-auth/react";

const LoginButtons = () => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
    <button 
      onClick={() => signIn('google')}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-all shadow"
    >
      <FcGoogle className="w-5 h-5" />
      <span>Continue with Google</span>
    </button>
    <button 
      onClick={() => signIn('github')}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all shadow"
    >
      <FiGithub className="w-5 h-5" />
      <span>Continue with GitHub</span>
    </button>
  </div>
);

export default LoginButtons; 