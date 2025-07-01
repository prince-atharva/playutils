import React, { useEffect, useState } from "react";
import { FiX, FiFile, FiFolder } from "react-icons/fi";
import type { FileItem } from "../types/file";

interface FileDetailsModalProps {
  show: boolean;
  file: FileItem | null;
  onClose: () => void;
  loading?: boolean;
}

// Helper to guess content type from file extension
function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'pdf': return 'application/pdf';
    case 'txt': return 'text/plain';
    case 'md': return 'text/markdown';
    case 'csv': return 'text/csv';
    case 'json': return 'application/json';
    case 'js': return 'application/javascript';
    case 'ts': return 'application/typescript';
    case 'css': return 'text/css';
    case 'html':
    case 'htm': return 'text/html';
    default: return '';
  }
}

export default function FileDetailsModal({ show, file, onClose }: FileDetailsModalProps) {
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Use backend contentType or guess from extension
  const contentType = file?.contentType || (file?.name ? guessContentType(file.name) : '');

  // Helper: Detect file type
  const isImage = file?.type === 'file' && contentType.startsWith('image/');
  const isPDF = file?.type === 'file' && (contentType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
  const isText = file?.type === 'file' && (contentType.startsWith('text/') || file.name.toLowerCase().match(/\.(txt|md|csv|json|js|ts|css|html)$/));

  useEffect(() => {
    if (show && file) {
      // Debug log for the file object
      // eslint-disable-next-line no-console
      console.log('FileDetailsModal file:', file);
    }
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
    setImgError(false);
  }, [show, isText, file?.previewUrl, file]);

  if (!show || !file) return null;

  // Download handler
  const handleDownload = () => {
    if (file && file.path && file.previewUrl) {
      // Always construct the download URL from previewUrl
      const downloadUrl = file.previewUrl.replace('/preview?', '/download?');
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-cyan-900/70 border border-cyan-800 rounded-3xl shadow-2xl p-0 flex flex-col gap-0 animate-fadeIn overflow-hidden">
        {/* Close Button */}
        <button className="absolute top-5 right-5 text-cyan-300 hover:text-white bg-cyan-900/40 hover:bg-cyan-700/70 rounded-full p-2 shadow-lg transition-all" onClick={onClose} aria-label="Close">
          <FiX className="w-7 h-7" />
        </button>
        {/* File Info Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 px-10 pt-10 pb-6 bg-gradient-to-r from-cyan-900/40 to-gray-900/30 border-b border-cyan-800">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-700 to-blue-700 shadow-lg">
            {file.type === 'folder' ? <FiFolder className="w-9 h-9 text-blue-300" /> : <FiFile className="w-9 h-9 text-cyan-300" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white truncate mb-1">{file.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-cyan-200 font-mono mt-1">
              <span><span className="font-semibold text-cyan-400">Type:</span> {file.type === 'file' ? 'File' : 'Folder'}</span>
              {file.type === 'file' && <span><span className="font-semibold text-cyan-400">Size:</span> {file.sizeLabel || '--'}</span>}
              {file.lastModifiedLabel && <span><span className="font-semibold text-cyan-400">Last Modified:</span> {file.lastModifiedLabel}</span>}
            </div>
          </div>
          {file.type === 'file' && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-700 transition-all text-base mt-4 md:mt-0"
            >
              <FiFile className="w-5 h-5" /> Download
            </button>
          )}
        </div>
        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center px-10 py-10 min-h-[320px] bg-gradient-to-br from-gray-900/60 to-cyan-900/30">
          {isImage && file.previewUrl && !imgError && (
            <img 
              src={file.previewUrl} 
              alt={file.name} 
              className="rounded-2xl max-h-[400px] object-contain border-2 border-cyan-800 shadow-xl bg-gray-900/40" 
              onError={() => setImgError(true)}
            />
          )}
          {isImage && imgError && (
            <div className="text-red-400 text-center py-8">Unable to load image preview.</div>
          )}
          {isPDF && file.previewUrl && (
            <iframe src={file.previewUrl} title={file.name} className="w-full h-96 rounded-xl border-2 border-cyan-800 bg-white shadow-xl" />
          )}
          {isText && (
            loading
              ? <div className="text-cyan-300 text-center py-8">Loading preview...</div>
              : <pre className="bg-gray-900/80 rounded-xl p-6 text-cyan-100 max-h-80 overflow-auto w-full shadow-inner border border-cyan-800 text-base whitespace-pre-wrap">{textPreview}</pre>
          )}
          {!isImage && !isPDF && !isText && (
            <div className="text-gray-400 text-center py-12">
              <div className="mb-2 text-lg font-semibold">No preview available for this {file.type}.</div>
              <div className="text-xs">You can download or open this {file.type === 'file' ? 'file' : 'folder'} in your storage provider for more options.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 