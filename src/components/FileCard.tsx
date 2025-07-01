import React from "react";
import { FiFolder, FiFile, FiDownload, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";
import type { FileItem } from "../types/file";

export default function FileCard({ file, onClick, onRename, onDelete, onDownload, onPreview }: { file: FileItem, onClick: () => void, onRename: () => void, onDelete: () => void, onDownload: () => void, onPreview: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.07, boxShadow: "0 0 32px 0 #22d3ee55" }}
      className="group relative flex flex-col items-center p-6 rounded-3xl bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-cyan-900/60 shadow-xl border border-cyan-800 hover:border-cyan-400 transition cursor-pointer select-none overflow-visible backdrop-blur-md"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
      aria-label={file.name}
    >
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 shadow-lg">
        {file.type === 'folder' ? <FiFolder className="text-blue-300 w-10 h-10 drop-shadow-lg" /> : <FiFile className="text-cyan-300 w-10 h-10 drop-shadow-lg" />}
      </div>
      <span className="text-white truncate w-full text-center text-lg font-bold mb-1 drop-shadow-lg">{file.name}</span>
      <span className="text-xs text-cyan-200 mb-1 font-mono">{file.type === 'file' ? file.sizeLabel : '--'}</span>
      <span className="text-xs text-gray-400 mb-3">{file.lastModifiedLabel}</span>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 bg-gray-900/80 rounded-full px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 border border-cyan-700 backdrop-blur"
      >
        <button onClick={e => { e.stopPropagation(); onPreview?.(); }} className="p-2 rounded-lg hover:bg-cyan-800 text-cyan-300" title="Preview"><FiEye className="w-5 h-5" /></button>
        <button onClick={e => { e.stopPropagation(); onDownload?.(); }} className="p-2 rounded-lg hover:bg-cyan-800 text-cyan-300" title="Download"><FiDownload className="w-5 h-5" /></button>
        <button onClick={e => { e.stopPropagation(); onRename?.(); }} className="p-2 rounded-lg hover:bg-yellow-700 text-yellow-300" title="Rename"><FiEdit2 className="w-5 h-5" /></button>
        <button onClick={e => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-lg hover:bg-red-800 text-red-400" title="Delete"><FiTrash2 className="w-5 h-5" /></button>
      </motion.div>
    </motion.div>
  );
} 