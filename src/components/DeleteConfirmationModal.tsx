import React, { useRef, useEffect } from "react";
import { FiTrash2, FiFolder, FiFile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { FileItem } from "../types/file";
import { formatBytes, formatDate } from "../utils/fileUtils";

interface DeleteConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: FileItem | null;
  confirmDisabled?: boolean;
}

export default function DeleteConfirmationModal({ show, onClose, onConfirm, file, confirmDisabled }: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (show && modalRef.current) {
      modalRef.current.focus();
    }
  }, [show]);
  
  if (!show || !file) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        aria-modal="true" 
        role="dialog"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          ref={modalRef}
          tabIndex={-1}
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-900/30 text-red-500">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
              <p className="text-gray-400 text-sm">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              {file.type === "folder" ? (
                <FiFolder className="w-6 h-6 text-blue-400" />
              ) : (
                <FiFile className="w-6 h-6 text-cyan-400" />
              )}
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {file.type === "file" ? formatBytes(file.size) : "Folder"} • {file.lastModified ? formatDate(file.lastModified) : ""}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-300">
            Are you sure you want to delete this {file.type}? All contents will be permanently removed.
          </p>
          
          <div className="flex gap-4 justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              aria-label="Cancel delete"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-60"
              aria-label="Confirm delete" 
              disabled={!!confirmDisabled}
            >
              {confirmDisabled ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 