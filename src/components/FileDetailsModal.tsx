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
        {isImage && file.previewUrl && !imgError && (
          <img 
            src={file.previewUrl} 
            alt={file.name} 
            className="rounded-lg max-h-64 object-contain border border-gray-800" 
            onError={() => setImgError(true)}
          />
        )}
        {isImage && imgError && (
          <div className="text-red-400 text-center py-8">Unable to load image preview.</div>
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