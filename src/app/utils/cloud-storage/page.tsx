"use client";

import React, { useState, useEffect } from "react";
import { FiCloud, FiPlus, FiDatabase, FiLoader, FiExternalLink, FiTrash2, FiHelpCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { ICloudStorage } from "../../../../server/model/cloudstorage.model";
import { CloudStorageAPI, S3ConnectionData } from "@/lib/api/cloudStorage";
import AnimatedBackground from "@/components/AnimatedBackground";
import ConnectionModal from "@/components/ConnectionModal";
import { motion } from "framer-motion";
import Link from "next/link";

const CloudStoragePage = () => {
  const [connections, setConnections] = useState<ICloudStorage[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await CloudStorageAPI.getConnections();
      setConnections(response.data?.connections || []);
      setCount(response.data?.count || 0);
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAddConnection = async (data: S3ConnectionData) => {
    try {
      const response = await CloudStorageAPI.createConnection(data);
      toast.success(response.message);
      fetchConnections();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: { y: -5, scale: 1.02 }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 overflow-x-hidden">
      <AnimatedBackground />

      <header className="relative z-0 w-full max-w-6xl mx-auto px-6 py-8 flex items-center gap-10 mb-12 bg-gradient-to-br from-cyan-950/80 via-blue-900/80 to-gray-900/80 rounded-3xl shadow-2xl border border-cyan-400/20 glassmorphism overflow-hidden animate-fadeInDown">
        {/* Animated floating clouds */}
        <div className="relative z-10 flex-shrink-0">
          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: 360, scale: [1, 1.08, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-cyan-400/20 border-t-cyan-400/60 shadow-cyan-400/10 shadow-xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-2 rounded-full bg-cyan-400/10 blur-lg"
          />
          <FiCloud className="w-20 h-20 text-cyan-400 drop-shadow-neon relative z-10" />
        </div>
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, type: "spring" }}
            className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 drop-shadow-neon tracking-tight animate-glow"
          >
            Cloud Storage
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
            className="text-xl text-cyan-100 mt-4 font-light max-w-xl drop-shadow-lg"
          >
            <span className="bg-gradient-to-r from-cyan-400/60 to-blue-400/60 bg-clip-text text-transparent font-semibold">
              Connect, organize, and manage
            </span>{" "}
            your cloud storage providers with a beautiful, unified interface.
          </motion.p>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full backdrop-blur-md bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800/50">
                <FiDatabase className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Storage Connections</h2>
                <p className="text-sm text-gray-400">Manage your S3-compatible storage providers</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-200 group"
              onClick={() => setShowModal(true)}
            >
              <FiPlus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Add Connection
            </motion.button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <FiLoader className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
          ) : count === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center"
            >
              <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gray-800/50 border border-gray-700">
                <FiCloud className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No connections found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Get started by adding your first S3-compatible storage connection to manage your files and buckets.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-medium transition-all shadow-md"
              >
                Create First Connection
              </motion.button>
            </motion.div>
          ) : (
            <motion.ul
              initial="initial"
              animate="animate"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {connections.map((conn, index) => (
                <motion.li
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ConnectionCard
                    connection={conn}
                    isHovered={hoveredCard === index}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>

        <ConnectionModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddConnection}
        />
      </main>
    </div>
  );
};

const ConnectionCard = ({
  connection,
  isHovered,
}: {
  connection: ICloudStorage,
  isHovered: boolean,
}) => {
  return (
    <div className={`relative h-full bg-gradient-to-br from-gray-800/50 to-gray-900/80 border rounded-xl p-5 shadow-lg flex flex-col gap-3 transition-all duration-300 overflow-hidden ${connection.status === "connected"
        ? "border-green-900/50 hover:border-green-700/50"
        : "border-red-900/50 hover:border-red-700/50"
      }`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-20 ${connection.status === "connected"
          ? "bg-green-500"
          : "bg-red-500"
        } ${isHovered ? "animate-pulse" : "opacity-0"} transition-opacity duration-300`}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${connection.status === "connected"
                ? "bg-green-900/30 text-green-400"
                : "bg-red-900/30 text-red-400"
              }`}>
              <FiCloud className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white truncate max-w-[120px]">
              {connection.name}
            </span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${connection.status === "connected"
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
            }`}>
            {connection.status === "connected" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">KEY:</span>
            <span className="font-mono text-cyan-300 truncate">
              {connection.accessKey}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">Bucket:</span>
            <span className="font-mono text-cyan-300 truncate">
              {connection.bucket}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">Region:</span>
            <span className="font-mono text-gray-300">
              {connection.region}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">Created:</span>
            <span className="text-gray-300">
              {new Date(connection.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800/50">
          <div className="flex gap-2">
            <button
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete connection"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <Link
            href={`/utils/cloud-storage/${connection._id}`}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <span>Explore</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CloudStoragePage;