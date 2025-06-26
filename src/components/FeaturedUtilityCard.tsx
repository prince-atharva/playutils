"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";

type FeaturedUtility = {
  title: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  link: string;
};

const FeaturedUtilityCard = ({ util, isLoggedIn }: { util: FeaturedUtility, isLoggedIn: boolean }) => {
  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      <div className="flex items-center gap-4 p-5 pb-0">
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr ${util.gradient} text-white text-3xl shadow-lg`}
        >
          {util.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{util.title}</h3>
          <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${util.gradient}`}></div>
        </div>
      </div>
      <div className="flex-1 px-5 py-4">
        <p className="text-gray-700 dark:text-gray-300 text-base">{util.description}</p>
      </div>
      <div className="px-5 pb-5 mt-auto">
        {isLoggedIn && <Link
          href={util.link}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="transition-transform group-hover:translate-x-1">
            <FiArrowRight className="w-5 h-5" />
          </span>
          <span>Explore</span>
        </Link>}
      </div>
    </div>
  );
};

export default FeaturedUtilityCard;