import React, { useEffect, useState } from "react";
import { FiX, FiFile, FiFolder } from "react-icons/fi";
import type { FileItem } from "../types/file";

interface FileDetailsModalProps {
  show: boolean;
  file: FileItem | null;
  onClose: () => void;
  loading?: boolean;
}

export default function FileDetailsModal({ show, file, onClose }: FileDetailsModalProps) {
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper: Detect file type
  const isImage = file?.type === 'file' && file.contentType?.startsWith('image/');
  const isPDF = file?.type === 'file' && (file.contentType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
  const isText = file?.type === 'file' && (file.contentType?.startsWith('text/') || file.name.toLowerCase().match(/\.(txt|md|csv|json|js|ts|css|html)$/));

  useEffect(() => {
    if (show && isText && file?.previewUrl) {
      setLoading(true);
      fetch(file.previewUrl)
        .then(res => res.text())
        .then(setTextPreview)
        .catch(() => setTextPreview("Unable to load preview."))
        .finally(() => setLoading(false));
    } else {
      setTextPreview(null);
    }
  }, [show, isText, file?.previewUrl]);

  if (!show || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={onClose} aria-label="Close"><FiX className="w-6 h-6" /></button>
        <div className="flex items-center gap-3 mb-2">
          {file.type === 'folder' ? <FiFolder className="w-6 h-6 text-blue-400" /> : <FiFile className="w-6 h-6 text-cyan-400" />}
          <span className="text-xl font-bold text-white">{file.name}</span>
        </div>
        <div className="text-gray-300 text-sm flex flex-col gap-1">
          <span><span className="font-semibold text-cyan-400">Type:</span> {file.type === 'file' ? 'File' : 'Folder'}</span>
          {file.type === 'file' && <span><span className="font-semibold text-cyan-400">Size:</span> {file.sizeLabel || '--'}</span>}
          {file.lastModifiedLabel && <span><span className="font-semibold text-cyan-400">Last Modified:</span> {file.lastModifiedLabel}</span>}
        </div>
        {/* Preview logic */}
        {isImage && file.previewUrl && (
          <img src={file.previewUrl} alt={file.name} className="rounded-lg max-h-64 object-contain border border-gray-800" />
        )}
        {isPDF && file.previewUrl && (
          <iframe src={file.previewUrl} title={file.name} className="w-full h-96 rounded-lg border border-gray-800 bg-white" />
        )}
        {isText && (
          loading
            ? <div className="text-cyan-300 text-center py-8">Loading preview...</div>
            : <pre className="bg-gray-800 rounded-lg p-4 text-gray-200 max-h-64 overflow-auto">{textPreview}</pre>
        )}
        {!isImage && !isPDF && !isText && (
          <div className="text-gray-500 text-center py-8">
            <div className="mb-2 text-lg">No preview available for this {file.type}.</div>
            <div className="text-xs">You can download or open this {file.type === 'file' ? 'file' : 'folder'} in your storage provider for more options.</div>
          </div>
        )}
      </div>
    </div>
  );
} 