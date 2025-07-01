"use client";

import React, { useState, useEffect } from "react";
import { 
  FiFolder, 
  FiFile, 
  FiDownload, 
  FiUpload, 
  FiTrash2, 
  FiMoreVertical,
  FiChevronLeft,
  FiHardDrive,
  FiPieChart,
  FiClock,
  FiStar,
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiHome,
  FiRefreshCw
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import FileDetailsModal from '@/components/FileDetailsModal';
import type { FileItem } from "@/types/file";
import { formatBytes, formatDate } from "@/utils/fileUtils";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { CloudStorageAPI } from "@/lib/api/cloudStorage";
import type { ICloudStorage } from "../../../../../server/model/cloudstorage.model";

function UploadModal({ show, onClose, onSuccess, connectionId, currentPath }: {
  show: boolean,
  onClose: () => void,
  onSuccess: () => void,
  connectionId: string,
  currentPath: string,
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };
  
  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        await CloudStorageAPI.uploadFile(connectionId, files[i], currentPath);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setFiles([]);
      setProgress(0);
      onSuccess();
      onClose();
      toast.success("Files uploaded successfully");
    } catch (err: any) {
      setError(err.message || "Upload failed");
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-900/30 text-blue-500">
            <FiUpload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload Files</h2>
            <p className="text-gray-400 text-sm">Destination: {currentPath || "Root"}</p>
          </div>
        </div>
        
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/50 rounded-xl p-8 bg-gray-800/30 cursor-pointer hover:bg-gray-700/50 transition group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <div className="p-4 mb-3 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 group-hover:scale-110 transition-transform">
            <FiUpload className="w-6 h-6" />
          </div>
          <input
            type="file"
            multiple
            ref={inputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-center">
            <span className="text-cyan-400 font-medium">Drag & drop files here</span>
            <span className="text-gray-400"> or </span>
            <span className="text-blue-400 font-medium">browse files</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">Supports all file types</p>
          
          {files.length > 0 && (
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Selected files ({files.length})</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                  className="text-red-400 text-sm hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto pr-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg mb-2">
                    <FiFile className="flex-shrink-0 text-cyan-400" />
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{file.name}</p>
                      <p className="text-gray-400 text-xs">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {uploading && (
          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
            disabled={uploading || !files.length}
          >
            {uploading ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FiUpload />
                Upload Files
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewFolderModal({ show, onClose, onSuccess, connectionId, currentPath }: {
  show: boolean,
  onClose: () => void,
  onSuccess: () => void,
  connectionId: string,
  currentPath: string,
}) {
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const folderPath = currentPath ? `${currentPath.replace(/\/$/, "")}/$import FileGrid from '@/components/FileGrid';{folderName}` : folderName;
      await CloudStorageAPI.createFolder(connectionId, folderPath);
      setFolderName("");
      onSuccess();
      onClose();
      toast.success("Folder created successfully");
    } catch (err: any) {
      setError(err.message || "Failed to create folder");
      toast.error(err.message || "Failed to create folder");
    } finally {
      setCreating(false);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-green-900/30 text-green-500">
            <FiFolder className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Folder</h2>
            <p className="text-gray-400 text-sm">Location: {currentPath || "Root"}</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-gray-300 text-sm">Folder name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter folder name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            disabled={creating}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-4 justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            disabled={creating}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2"
            disabled={creating || !folderName.trim()}
          >
            {creating ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FiFolder />
                Create Folder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RenameModal({ show, onClose, onSuccess, connectionId, currentPath, file }: {
  show: boolean,
  onClose: () => void,
  onSuccess: () => void,
  connectionId: string,
  currentPath: string,
  file: FileItem | null,
}) {
  const [newName, setNewName] = useState(file?.name || "");
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewName(file?.name || "");
    setError(null);
  }, [file, show]);

  const handleRename = async () => {
    if (!file || !newName.trim() || newName === file.name) return;
    setRenaming(true);
    setError(null);
    try {
      const newPath = (currentPath ? `${currentPath.replace(/\/$/, "")}/` : "") + newName;
      await CloudStorageAPI.renameObject(connectionId, file.path, newPath);
      onSuccess();
      onClose();
      toast.success(`${file.type === 'folder' ? 'Folder' : 'File'} renamed successfully`);
    } catch (err: any) {
      setError(err.message || "Failed to rename");
      toast.error(err.message || "Failed to rename");
    } finally {
      setRenaming(false);
    }
  };
  
  if (!show || !file) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-cyan-900/30 text-cyan-500">
            <FiFile className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Rename {file.type === 'folder' ? 'Folder' : 'File'}</h2>
            <p className="text-gray-400 text-sm">Location: {currentPath || "Root"}</p>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            {file.type === "folder" ? (
              <FiFolder className="w-6 h-6 text-blue-400" />
            ) : (
              <FiFile className="w-6 h-6 text-cyan-400" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm line-through opacity-70 truncate">{file.name}</p>
              <p className="text-gray-400 text-xs">
                {file.type === "file" ? formatBytes(file.size) : "Folder"} • {file.lastModified ? formatDate(file.lastModified) : ""}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-gray-300 text-sm">New name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder={`Enter new ${file.type} name`}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={renaming}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-4 justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            disabled={renaming}
          >
            Cancel
          </button>
          <button 
            onClick={handleRename} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2"
            disabled={renaming || !newName.trim() || newName === file.name}
          >
            {renaming ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Renaming...
              </>
            ) : (
              <>
                <FiFile />
                Rename
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ path, onNavigate }: { path: string, onNavigate: (path: string) => void }) {
  const parts = path.split('/').filter(Boolean);
  const crumbs = [
    { name: 'Root', path: '' },
    ...parts.map((part, idx) => ({
      name: part,
      path: parts.slice(0, idx + 1).join('/'),
    })),
  ];
  
  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.path} className="flex items-center">
          <button
            className={`flex items-center gap-1 hover:text-white transition-colors ${idx === crumbs.length - 1 ? 'font-bold text-white' : 'text-cyan-400 hover:underline'}`}
            onClick={() => idx !== crumbs.length - 1 && onNavigate(crumb.path)}
            disabled={idx === crumbs.length - 1}
          >
            {idx === 0 && <FiHome className="w-4 h-4" />}
            {idx !== 0 && crumb.name}
          </button>
          {idx < crumbs.length - 1 && <span className="mx-1 text-gray-500">/</span>}
        </span>
      ))}
    </nav>
  );
}

const ExplorerPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState<ICloudStorage | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPathState] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storageStats, setStorageStats] = useState({
    total: 0,
    used: 0,
    available: 0,
    objectCount: 0
  });
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Sync currentPath with query string
  useEffect(() => {
    const initialPath = searchParams.get("path") || "";
    setCurrentPathState(initialPath);
  }, [searchParams]);

  // Helper to update both state and query
  const setCurrentPath = (path: string) => {
    setCurrentPathState(path);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (path) {
      params.set("path", path);
    } else {
      params.delete("path");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const fetchConnection = async () => {
    try {
      setLoading(true);
      const response = await CloudStorageAPI.getConnection(id as string);
      setConnection(response.data ?? null);
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
      router.push("/cloud-storage");
    }
  };

  const fetchFilesAndStats = async () => {
    if (!connection) return;
    try {
      setRefreshing(true);
      const contentsRes = await CloudStorageAPI.getBucketContents(String(connection._id), {
        prefix: currentPath || undefined,
        delimiter: "/",
      });
      const statsRes = await CloudStorageAPI.getBucketMetrics(String(connection._id));
      const filesList: FileItem[] = [];
      if (contentsRes.data) {
        contentsRes.data.folders.forEach((folder) => {
          filesList.push({
            name: folder.prefix.split("/").filter(Boolean).pop() || folder.prefix,
            path: folder.prefix,
            size: 0,
            lastModified: "",
            type: "folder",
            contentType: '',
            previewUrl: '',
          });
        });
        contentsRes.data.files.forEach((file) => {
          // Only use contentType if it looks like a MIME type
          let contentType = (file as any).contentType;
          if (!contentType || typeof contentType !== 'string' || !contentType.includes('/')) {
            // Guess from extension
            const ext = file.key.split('.').pop()?.toLowerCase();
            if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
            else if (ext === 'png') contentType = 'image/png';
            else if (ext === 'gif') contentType = 'image/gif';
            else if (ext === 'webp') contentType = 'image/webp';
            else if (ext === 'svg') contentType = 'image/svg+xml';
            else if (ext === 'pdf') contentType = 'application/pdf';
            else if (ext === 'txt') contentType = 'text/plain';
            else if (ext === 'md') contentType = 'text/markdown';
            else if (ext === 'csv') contentType = 'text/csv';
            else if (ext === 'json') contentType = 'application/json';
            else if (ext === 'js') contentType = 'application/javascript';
            else if (ext === 'ts') contentType = 'application/typescript';
            else if (ext === 'css') contentType = 'text/css';
            else if (ext === 'html' || ext === 'htm') contentType = 'text/html';
            else contentType = '';
          }

          filesList.push({
            name: file.key.split("/").pop() || file.key,
            path: file.key,
            size: file.size,
            lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : "",
            type: "file",
            contentType,
            previewUrl: `/v1/api/cloudStorage/S3Connections/${connection._id}/preview?path=${encodeURIComponent(file.key)}`,
          });
        });
      }
      setFiles(filesList);  
      if (statsRes.data) {
        setStorageStats({
          total: statsRes.data.totalSize,
          used: statsRes.data.totalSize,
          available: 0,
          objectCount: statsRes.data.objectCount,
        });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, [id, router]);

  useEffect(() => {
    fetchFilesAndStats();
  }, [connection, currentPath]);

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      setCurrentPath(file.path);
    } else {
      setSelectedFile(file);
      setShowPreview(true);
    }
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
  };

  const handleRefresh = () => {
    fetchFilesAndStats();
  };

  const handleUploadSuccess = () => {
    fetchFilesAndStats();
  };

  const handleDeleteClick = (file: FileItem) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete || !connection) return;
    try {
      await CloudStorageAPI.deleteFile(String(connection._id), fileToDelete.path, fileToDelete.type);
      toast.success(`${fileToDelete.type === "folder" ? "Folder" : "File"} deleted successfully`);
      setFiles(files.filter(f => f.path !== fileToDelete.path));
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const handleRenameClick = (file: FileItem) => {
    setFileToRename(file);
    setShowRenameModal(true);
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select all/none logic
  const allVisiblePaths = filteredFiles.map(f => f.path);
  const allSelected = allVisiblePaths.length > 0 && allVisiblePaths.every(path => selected.includes(path));
  const someSelected = selected.length > 0;

  const toggleSelect = (path: string) => {
    setSelected(sel => sel.includes(path) ? sel.filter(p => p !== path) : [...sel, path]);
  };
  
  const toggleSelectAll = () => {
    if (allSelected) setSelected(sel => sel.filter(path => !allVisiblePaths.includes(path)));
    else setSelected(sel => Array.from(new Set([...sel, ...allVisiblePaths])));
  };
  
  const clearSelection = () => setSelected([]);

  // Batch download
  const handleBatchDownload = () => {
    if (!connection) return;
    selected.forEach(path => {
      const file = files.find(f => f.path === path);
      if (file && file.type === "file") {
        const downloadUrl = `/v1/api/cloudStorage/S3Connections/${connection._id}/download?path=${encodeURIComponent(file.path)}`;
        window.open(downloadUrl, '_blank');
      }
    });
    clearSelection();
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (!connection || !selected.length) return;
    setBatchDeleting(true);
    try {
      for (const path of selected) {
        const file = files.find(f => f.path === path);
        if (file) {
          await CloudStorageAPI.deleteFile(String(connection._id), file.path, file.type);
        }
      }
      toast.success(`${selected.length} items deleted successfully`);
      fetchFilesAndStats();
      clearSelection();
    } catch (error: any) {
      toast.error(error?.data?.message || error.message);
    } finally {
      setBatchDeleting(false);
    }
  };

  if (!connection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-cyan-900 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute w-96 h-96 bg-cyan-700 rounded-full blur-3xl opacity-30 animate-pulse -z-10" style={{ top: '20%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        {/* Spinner with icon */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 border-4 border-cyan-500 shadow-lg">
            <FiHardDrive className="w-10 h-10 text-cyan-400 animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading your cloud storage...</h2>
        <p className="text-cyan-200 text-sm">Fetching your files and folders. Please wait!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 overflow-x-hidden">
      {/* Main Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/utils/cloud-storage')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium transition-all"
              aria-label="Back to Connections"
            >
              <FiChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-gray-800">
                <FiHardDrive className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{connection.name}</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span>{connection.bucket}</span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                  <span>{connection.region}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-cyan-400 transition-colors"
              disabled={refreshing}
            >
              <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all"
            >
              <FiFolder className="w-4 h-4" />
              New Folder
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <FiUpload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </header>

      {/* Batch actions toolbar */}
      {someSelected && (
        <div className="fixed top-0 left-0 w-full z-40 bg-gray-900 border-b border-cyan-800/50 py-3 px-6 flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <span className="text-cyan-400 font-semibold">{selected.length} selected</span>
          <button
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-2"
            onClick={handleBatchDownload}
          >
            <FiDownload className="w-4 h-4" />
            Download
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            onClick={handleBatchDelete}
            disabled={batchDeleting}
          >
            <FiTrash2 className="w-4 h-4" />
            {batchDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="ml-auto px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center gap-2"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>
      )}

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-12">
        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 hover:border-cyan-800/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-blue-900/20 text-blue-400 group-hover:bg-blue-900/30 transition-colors">
                <FiHardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-gray-400">Total Storage</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatBytes(storageStats.total)}
            </p>
          </div>
          
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 hover:border-cyan-800/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-cyan-900/20 text-cyan-400 group-hover:bg-cyan-900/30 transition-colors">
                <FiPieChart className="w-5 h-5" />
              </div>
              <h3 className="text-gray-400">Used Storage</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatBytes(storageStats.used)}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({Math.round((storageStats.used / storageStats.total) * 100)}%)
              </span>
            </p>
          </div>
          
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 hover:border-cyan-800/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-green-900/20 text-green-400 group-hover:bg-green-900/30 transition-colors">
                <FiStar className="w-5 h-5" />
              </div>
              <h3 className="text-gray-400">Available</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatBytes(storageStats.available)}
            </p>
          </div>
          
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-6 hover:border-cyan-800/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-purple-900/20 text-purple-400 group-hover:bg-purple-900/30 transition-colors">
                <FiFile className="w-5 h-5" />
              </div>
              <h3 className="text-gray-400">Objects</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {storageStats.objectCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* File Explorer */}
        <div className="backdrop-blur-md bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-gray-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Breadcrumbs 
                path={currentPath} 
                onNavigate={(path) => setCurrentPath(path)}
              />
              {currentPath && (
                <button 
                  onClick={handleNavigateUp}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Go up"
                >
                  <FiChevronLeft className="w-5 h-5 transform rotate-90" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-700 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-700 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                  title="List view"
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* File List Header - Only for list view */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 border-b border-gray-800 text-gray-400 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-cyan-500 w-4 h-4"
                />
              </div>
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          )}
          
          {/* File Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FiFolder className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg text-gray-300 mb-1">
                  {searchQuery ? "No files match your search" : "This folder is empty"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? "Try a different search term" : "Upload files or create a folder to get started"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload Files
                  </button>
                  <button 
                    onClick={() => setShowNewFolderModal(true)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                  >
                    <FiFolder className="w-4 h-4" />
                    New Folder
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.path}
                    className={`relative bg-gray-800/50 border rounded-xl p-4 hover:border-cyan-500/50 transition-colors ${selected.includes(file.path) ? 'border-cyan-500 bg-cyan-900/10' : 'border-gray-700'}`}
                    onClick={() => {
                      if (file.type === 'folder') {
                        setCurrentPath(file.path);
                      } else {
                        setSelectedFile(file);
                        setShowPreview(true);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        {file.type === "folder" ? (
                          <FiFolder className="w-12 h-12 text-blue-400" />
                        ) : (
                          <FiFile className="w-12 h-12 text-cyan-400" />
                        )}
                        {selected.includes(file.path) && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <h4 className="text-white font-medium text-sm truncate w-full">{file.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {file.type === "file" ? formatBytes(file.size) : "Folder"}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button
                        className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(sel => sel.includes(file.path) ? sel.filter(p => p !== file.path) : [...sel, file.path]);
                        }}
                        title="Select"
                      >
                        <FiMoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.path}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${selected.includes(file.path) ? 'bg-cyan-900/10' : 'hover:bg-gray-800/30'}`}
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(file.path)}
                        onChange={() => toggleSelect(file.path)}
                        className="accent-cyan-500 w-4 h-4"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div 
                      className="col-span-5 flex items-center gap-3 cursor-pointer"
                      onClick={() => handleFileClick(file)}
                    >
                      {file.type === "folder" ? (
                        <FiFolder className="w-5 h-5 text-blue-400" />
                      ) : (
                        <FiFile className="w-5 h-5 text-cyan-400" />
                      )}
                      <span className="text-white truncate">{file.name}</span>
                    </div>
                    
                    <div className="col-span-2 text-gray-400 flex items-center">
                      {file.type === "file" ? formatBytes(file.size) : "--"}
                    </div>
                    
                    <div className="col-span-2 text-gray-400 flex items-center">
                      <FiClock className="w-4 h-4 mr-2" />
                      {file.lastModified ? formatDate(file.lastModified) : "--"}
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      {file.type === "file" && (
                        <button
                          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Download"
                          onClick={e => {
                            e.stopPropagation();
                            if (connection) {
                              const downloadUrl = `/v1/api/cloudStorage/S3Connections/${connection._id}/download?path=${encodeURIComponent(file.path)}`;
                              window.open(downloadUrl, '_blank');
                            }
                          }}
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="More actions"
                        onClick={e => { e.stopPropagation(); }}
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(file);
                        }}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <button
          onClick={() => setShowUploadModal(true)}
          className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all"
        >
          <FiPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setFileToDelete(null); clearSelection(); }}
        onConfirm={handleDeleteConfirm}
        file={fileToDelete}
        confirmDisabled={batchDeleting}
      />
      
      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        connectionId={connection._id ? String(connection._id) : ""}
        currentPath={currentPath}
      />
      
      <NewFolderModal
        show={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onSuccess={handleUploadSuccess}
        connectionId={connection._id ? String(connection._id) : ""}
        currentPath={currentPath}
      />
      
      <RenameModal
        show={showRenameModal}
        onClose={() => { setShowRenameModal(false); setFileToRename(null); }}
        onSuccess={handleUploadSuccess}
        connectionId={connection._id ? String(connection._id) : ""}
        currentPath={currentPath}
        file={fileToRename}
      />
      
      <FileDetailsModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        file={selectedFile}
      />
    </div>
  );
};

export default ExplorerPage;