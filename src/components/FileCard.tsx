import React from "react";
import { FiFolder, FiFile, FiDownload, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";
import type { FileItem } from "../types/file";

export default function FileCard({ file, onClick, onRename, onDelete, onDownload, onPreview }: { file: FileItem, onClick: () => void, onRename: () => void, onDelete: () => void, onDownload: () => void, onPreview: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className="group relative flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 shadow-lg border border-gray-800 hover:border-cyan-500 transition cursor-pointer select-none overflow-visible"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
      aria-label={file.name}
    >
      <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-700 to-blue-700 shadow-lg">
        {file.type === 'folder' ? <FiFolder className="text-blue-300 w-8 h-8" /> : <FiFile className="text-cyan-300 w-8 h-8" />}
      </div>
      <span className="text-white truncate w-full text-center text-base font-semibold mb-1 drop-shadow">{file.name}</span>
      <span className="text-xs text-cyan-200 mb-1 font-mono">{file.type === 'file' ? file.sizeLabel : '--'}</span>
      <span className="text-xs text-gray-400 mb-2">{file.lastModifiedLabel}</span>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-2 bg-gray-900/90 rounded-full px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 border border-cyan-700"
      >
        <button onClick={e => { e.stopPropagation(); onPreview?.(); }} className="p-1 rounded hover:bg-cyan-800 text-cyan-300" title="Preview"><FiEye /></button>
        <button onClick={e => { e.stopPropagation(); onDownload?.(); }} className="p-1 rounded hover:bg-cyan-800 text-cyan-300" title="Download"><FiDownload /></button>
        <button onClick={e => { e.stopPropagation(); onRename?.(); }} className="p-1 rounded hover:bg-yellow-700 text-yellow-300" title="Rename"><FiEdit2 /></button>
        <button onClick={e => { e.stopPropagation(); onDelete?.(); }} className="p-1 rounded hover:bg-red-800 text-red-400" title="Delete"><FiTrash2 /></button>
      </motion.div>
    </motion.div>
  );
} 