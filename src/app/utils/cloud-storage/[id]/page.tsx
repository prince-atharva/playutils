"use client";

import React, { useState, useEffect } from "react";
import {
  FiFolder,
  FiFile,
  FiDownload,
  FiUpload,
  FiTrash2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-fadeIn" aria-modal="true" role="dialog">
      <div className="relative bg-gradient-to-br from-[#0f172a]/90 via-cyan-900/90 to-blue-900/90 border-2 border-cyan-400/40 rounded-3xl shadow-2xl p-10 w-full max-w-lg mx-auto flex flex-col gap-8 scale-100 animate-scaleIn glassmorphism">
        {/* Neon Glow */}
        <div className="absolute -inset-2 rounded-3xl pointer-events-none z-0 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-transparent blur-2xl animate-pulse" />
        <div className="flex items-center gap-3 z-10">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-700/60 to-cyan-600/60 text-blue-200 shadow-lg animate-glow">
            <FiUpload className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow-neon">Upload Files</h2>
            <p className="text-cyan-200 text-sm font-mono">Destination: <span className="font-bold">{currentPath || "Root"}</span></p>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400/60 rounded-2xl p-8 bg-gradient-to-br from-gray-900/60 to-cyan-900/30 cursor-pointer hover:bg-cyan-900/30 transition group shadow-inner"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <div className="p-4 mb-3 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-cyan-300 group-hover:scale-110 transition-transform shadow-lg animate-glow">
            <FiUpload className="w-7 h-7" />
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
            <span className="text-cyan-300 font-bold animate-pulse">Drag & drop files here</span>
            <span className="text-gray-400"> or </span>
            <span className="text-blue-400 font-bold underline decoration-cyan-400/60">browse files</span>
          </p>
          <p className="text-cyan-400 text-xs mt-1 font-mono">Supports all file types</p>

          {files.length > 0 && (
            <div className="mt-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-300 text-xs font-mono">Selected files ({files.length})</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                  className="text-red-400 text-xs hover:underline font-bold"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto pr-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gradient-to-r from-cyan-900/40 to-blue-900/30 rounded-lg mb-2 shadow">
                    <FiFile className="flex-shrink-0 text-cyan-400" />
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{file.name}</p>
                      <p className="text-cyan-300 text-xs">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-400 text-sm font-bold shadow animate-shake">
            {error}
          </div>
        )}

        {uploading && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-cyan-200 mb-1 font-mono">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 h-2 rounded-full animate-progress"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800/80 text-cyan-200 hover:bg-gray-700 hover:text-white font-bold transition-all shadow"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-600 text-white font-bold shadow-lg hover:shadow-cyan-400/30 transition-all flex items-center gap-2 animate-glow"
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
      const folderPath = currentPath ? `${currentPath.replace(/\/$/, "")}/${folderName}` : folderName;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-fadeIn" aria-modal="true" role="dialog">
      <div className="relative bg-gradient-to-br from-gray-900/90 via-cyan-900/90 to-blue-900/90 border-2 border-green-400/40 rounded-3xl shadow-2xl p-10 w-full max-w-lg mx-auto flex flex-col gap-8 scale-100 animate-scaleIn glassmorphism">
        <div className="absolute -inset-2 rounded-3xl pointer-events-none z-0 bg-gradient-to-br from-green-400/20 via-emerald-400/10 to-transparent blur-2xl animate-pulse" />
        <div className="flex items-center gap-3 z-10">
          <div className="p-3 rounded-full bg-gradient-to-br from-green-700/60 to-emerald-600/60 text-green-200 shadow-lg animate-glow">
            <FiFolder className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow-neon">Create New Folder</h2>
            <p className="text-green-200 text-sm font-mono">Location: <span className="font-bold">{currentPath || "Root"}</span></p>
          </div>
        </div>
        <div className="space-y-2 z-10">
          <label className="text-green-300 text-sm font-bold">Folder name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-gray-800/80 text-white border border-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-mono"
            placeholder="Enter folder name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            disabled={creating}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-400 text-sm font-bold shadow animate-shake">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800/80 text-green-200 hover:bg-gray-700 hover:text-white font-bold transition-all shadow"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 via-emerald-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-emerald-400/30 transition-all flex items-center gap-2 animate-glow"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-fadeIn" aria-modal="true" role="dialog">
      <div className="relative bg-gradient-to-br from-gray-900/90 via-cyan-900/90 to-blue-900/90 border-2 border-cyan-400/40 rounded-3xl shadow-2xl p-10 w-full max-w-lg mx-auto flex flex-col gap-8 scale-100 animate-scaleIn glassmorphism">
        <div className="absolute -inset-2 rounded-3xl pointer-events-none z-0 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-transparent blur-2xl animate-pulse" />
        <div className="flex items-center gap-3 z-10">
          <div className="p-3 rounded-full bg-gradient-to-br from-cyan-700/60 to-blue-600/60 text-cyan-200 shadow-lg animate-glow">
            <FiFile className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow-neon">Rename {file.type === 'folder' ? 'Folder' : 'File'}</h2>
            <p className="text-cyan-200 text-sm font-mono">Location: <span className="font-bold">{currentPath || "Root"}</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-cyan-900/30 rounded-xl p-4 border border-cyan-400/20 shadow-inner z-10">
          <div className="flex items-center gap-3">
            {file.type === "folder" ? (
              <FiFolder className="w-6 h-6 text-blue-400" />
            ) : (
              <FiFile className="w-6 h-6 text-cyan-400" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm line-through opacity-70 truncate">{file.name}</p>
              <p className="text-cyan-300 text-xs font-mono">
                {file.type === "file" ? formatBytes(file.size) : "Folder"} • {file.lastModified ? formatDate(file.lastModified) : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 z-10">
          <label className="text-cyan-300 text-sm font-bold">New name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-gray-800/80 text-white border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono"
            placeholder={`Enter new ${file.type} name`}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={renaming}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-400 text-sm font-bold shadow animate-shake">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800/80 text-cyan-200 hover:bg-gray-700 hover:text-white font-bold transition-all shadow"
            disabled={renaming}
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-500 to-blue-600 text-white font-bold shadow-lg hover:shadow-cyan-400/30 transition-all flex items-center gap-2 animate-glow"
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
    <nav className="flex items-center gap-1 text-sm font-mono">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.path} className="flex items-center">
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 ${idx === crumbs.length - 1
              ? 'font-bold text-white bg-gradient-to-r from-cyan-600/80 to-blue-600/80 shadow-cyan-400/20 shadow'
              : 'text-cyan-300 hover:underline hover:bg-cyan-900/40'
              }`}
            onClick={() => idx !== crumbs.length - 1 && onNavigate(crumb.path)}
            disabled={idx === crumbs.length - 1}
          >
            {idx === 0 && <FiHome className="w-4 h-4" />}
            {idx !== 0 && crumb.name}
          </button>
          {idx < crumbs.length - 1 && <span className="mx-1 text-cyan-400 font-bold">/</span>}
        </span>
      ))}
    </nav>
  );
}

// --- Main Explorer Page with Attractive UI ---
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
          let contentType = (file as any).contentType;
          if (!contentType || typeof contentType !== 'string' || !contentType.includes('/')) {
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
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 border-4 border-cyan-500 shadow-lg animate-glow">
            <FiHardDrive className="w-10 h-10 text-cyan-400 animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2 drop-shadow-neon">Loading your cloud storage...</h2>
        <p className="text-cyan-200 text-sm font-mono">Fetching your files and folders. Please wait!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-gray-900 to-gray-800 overflow-x-hidden">
      {/* Animated background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
      {/* Main Header */}
      <header className="relative mt-10 z-10 w-full max-w-7xl mx-auto px-6 py-10 rounded-3xl bg-gradient-to-br from-cyan-900/80 via-gray-900/90 to-blue-900/80 border border-cyan-400/30 shadow-2xl backdrop-blur-2xl mb-8 animate-fadeIn glassmorphism">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/utils/cloud-storage')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-800/80 hover:bg-cyan-800/80 text-cyan-200 hover:text-white font-bold shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-lg"
              aria-label="Back to Connections"
              title="Back to Connections"
            >
              <FiChevronLeft className="w-6 h-6" />
              Back
            </button>
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-cyan-400/30 shadow-xl animate-glow">
                <FiHardDrive className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-white drop-shadow-neon tracking-wide">{connection.name}</h1>
                <p className="text-cyan-200 text-base flex items-center gap-2 font-mono">
                  <span>{connection.bucket}</span>
                  <span className="w-1 h-1 bg-cyan-600 rounded-full"></span>
                  <span>{connection.region}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="p-3 rounded-2xl bg-gray-800/80 hover:bg-cyan-800/80 text-cyan-300 hover:text-cyan-100 shadow-lg transition-all duration-300 animate-glow"
              disabled={refreshing}
              title="Refresh"
            >
              <FiRefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-600 via-emerald-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/30 transition-all duration-300 text-lg animate-glow"
              title="Create New Folder"
            >
              <FiFolder className="w-5 h-5" />
              New Folder
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-600 text-white font-bold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-lg animate-glow"
              title="Upload Files"
            >
              <FiUpload className="w-5 h-5" />
              Upload
            </button>
          </div>
        </div>
      </header>

      {/* Batch actions toolbar */}
      {someSelected && (
        <div className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-cyan-900/90 via-gray-900/90 to-blue-900/90 border-b border-cyan-400/30 py-3 px-6 flex items-center gap-4 shadow-lg backdrop-blur-md animate-fadeInDown">
          <span className="text-cyan-400 font-bold">{selected.length} selected</span>
          <button
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-2 font-bold shadow animate-glow"
            onClick={handleBatchDownload}
          >
            <FiDownload className="w-4 h-4" />
            Download
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 font-bold shadow animate-glow"
            onClick={handleBatchDelete}
            disabled={batchDeleting}
          >
            <FiTrash2 className="w-4 h-4" />
            {batchDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="ml-auto px-3 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center gap-2 font-bold"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>
      )}

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-12">
        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 animate-fadeIn">
          <div className="bg-gradient-to-br from-cyan-900/80 via-gray-900/90 to-blue-900/80 border border-cyan-400/30 rounded-3xl p-7 shadow-xl hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-300 group backdrop-blur-md glassmorphism">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-full bg-gradient-to-tr from-blue-500/40 to-cyan-400/40 text-cyan-300 shadow-lg group-hover:scale-110 transition-transform animate-glow">
                <FiHardDrive className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-cyan-200 tracking-wide font-mono">Total Storage</h3>
            </div>
            <p className="text-3xl font-extrabold text-white drop-shadow-neon font-mono">
              {formatBytes(storageStats.total)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/80 via-gray-900/90 to-blue-900/80 border border-cyan-400/30 rounded-3xl p-7 shadow-xl hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-300 group backdrop-blur-md glassmorphism">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-full bg-gradient-to-tr from-cyan-500/40 to-blue-400/40 text-cyan-300 shadow-lg group-hover:scale-110 transition-transform animate-glow">
                <FiPieChart className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-cyan-200 tracking-wide font-mono">Used Storage</h3>
            </div>
            <p className="text-3xl font-extrabold text-white drop-shadow-neon font-mono">
              {formatBytes(storageStats.used)}
              <span className="text-base font-normal text-cyan-200 ml-2">
                ({Math.round((storageStats.used / storageStats.total) * 100)}%)
              </span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/80 via-gray-900/90 to-emerald-900/80 border border-green-400/30 rounded-3xl p-7 shadow-xl hover:scale-105 hover:shadow-green-400/30 transition-all duration-300 group backdrop-blur-md glassmorphism">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-full bg-gradient-to-tr from-green-500/40 to-emerald-400/40 text-green-300 shadow-lg group-hover:scale-110 transition-transform animate-glow">
                <FiStar className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-green-200 tracking-wide font-mono">Available</h3>
            </div>
            <p className="text-3xl font-extrabold text-white drop-shadow-neon font-mono">
              {formatBytes(storageStats.available)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/80 via-gray-900/90 to-indigo-900/80 border border-purple-400/30 rounded-3xl p-7 shadow-xl hover:scale-105 hover:shadow-purple-400/30 transition-all duration-300 group backdrop-blur-md glassmorphism">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-full bg-gradient-to-tr from-purple-500/40 to-indigo-400/40 text-purple-300 shadow-lg group-hover:scale-110 transition-transform animate-glow">
                <FiFile className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-purple-200 tracking-wide font-mono">Objects</h3>
            </div>
            <p className="text-3xl font-extrabold text-white drop-shadow-neon font-mono">
              {storageStats.objectCount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* File Explorer */}
        <div className="backdrop-blur-md bg-gradient-to-br from-gray-900/80 via-cyan-900/60 to-blue-900/80 border border-cyan-400/20 rounded-2xl shadow-2xl overflow-hidden glassmorphism">
          {/* Toolbar */}
          <div className="border-b border-cyan-400/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-cyan-900/40 via-gray-900/60 to-blue-900/40">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Breadcrumbs
                path={currentPath}
                onNavigate={(path) => setCurrentPath(path)}
              />
              {currentPath && (
                <button
                  onClick={handleNavigateUp}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-cyan-800 text-cyan-400 hover:text-white transition-colors shadow"
                  title="Go up"
                >
                  <FiChevronLeft className="w-5 h-5 transform rotate-90" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-cyan-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/80 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-800/80 rounded-lg p-1 shadow">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-700 text-white shadow animate-glow' : 'text-cyan-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-cyan-700 text-white shadow animate-glow' : 'text-cyan-400 hover:text-white'}`}
                  title="List view"
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* File List Header - Only for list view */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-cyan-900/30 border-b border-cyan-400/20 text-cyan-300 text-sm font-bold font-mono">
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
              <div className="flex justify-center p-12 w-full">
                <div className="w-32 h-8 bg-gradient-to-r from-cyan-800/40 via-cyan-600/30 to-cyan-800/40 rounded-xl animate-pulse" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-900/60 to-blue-900/60 rounded-full flex items-center justify-center mb-4 shadow-lg animate-glow">
                  <FiFolder className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-lg text-cyan-200 mb-1 font-bold font-mono">
                  {searchQuery ? "No files match your search" : "This folder is empty"}
                </h3>
                <p className="text-cyan-400 mb-6 font-mono">
                  {searchQuery ? "Try a different search term" : "Upload files or create a folder to get started"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:bg-cyan-700 flex items-center gap-2 font-bold shadow animate-glow"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload Files
                  </button>
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-cyan-200 hover:bg-cyan-800 flex items-center gap-2 font-bold shadow"
                  >
                    <FiFolder className="w-4 h-4" />
                    New Folder
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 bg-gradient-to-br from-cyan-950/60 via-blue-900/40 to-gray-900/60 rounded-3xl shadow-2xl">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.path}
                    className={`relative group bg-gradient-to-br from-cyan-900/60 via-blue-900/40 to-gray-800/60 border-2 rounded-3xl p-6 shadow-xl hover:scale-[1.07] hover:border-cyan-400/80 hover:shadow-cyan-400/20 transition-all duration-300 cursor-pointer overflow-hidden ${selected.includes(file.path) ? 'border-cyan-500 bg-cyan-900/30 shadow-cyan-500/30 animate-glow' : 'border-cyan-400/20'}`}
                    title={file.name}
                  >
                    {/* Animated Glow */}
                    <div className={`absolute -inset-1 rounded-3xl pointer-events-none z-0 transition-all duration-500 ${selected.includes(file.path) ? 'bg-cyan-400/10 blur-lg animate-pulse' : 'group-hover:bg-cyan-400/10 group-hover:blur-md'}`}></div>

                    {/* Select Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.includes(file.path)}
                      onChange={e => {
                        e.stopPropagation();
                        if (typeof toggleSelect === "function") toggleSelect(file.path);
                      }}
                      className="absolute top-4 left-4 z-20 accent-cyan-500 w-5 h-5 bg-gray-900/80 border border-cyan-700 rounded focus:ring-2 focus:ring-cyan-400 shadow-md"
                      onClick={e => e.stopPropagation()}
                      title={selected.includes(file.path) ? "Deselect" : "Select"}
                    />
                    <div
                      className="flex flex-col items-center text-center relative z-10"
                      onClick={() => {
                        if (file.type === 'folder') {
                          setCurrentPath(file.path);
                        } else {
                          setSelectedFile(file);
                          setShowPreview(true);
                        }
                      }}
                    >
                      <div className="relative mb-4">
                        <div className={`absolute -top-3 -left-3 w-16 h-16 rounded-full blur-2xl opacity-40 pointer-events-none ${file.type === "folder" ? "bg-blue-400" : "bg-cyan-400"}`}></div>
                        {file.type === "folder" ? (
                          <div className="relative">
                            <FiFolder className="w-16 h-16 text-blue-400 drop-shadow-xl group-hover:scale-110 group-hover:text-cyan-300 transition-transform duration-300 animate-glow" />
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs rounded-full bg-blue-900/80 text-cyan-200 font-semibold shadow group-hover:bg-cyan-700/80 transition-colors font-mono">Folder</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <FiFile className="w-16 h-16 text-cyan-400 drop-shadow-xl group-hover:scale-110 group-hover:text-blue-300 transition-transform duration-300 animate-glow" />
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs rounded-full bg-cyan-900/80 text-blue-200 font-semibold shadow group-hover:bg-blue-700/80 transition-colors font-mono">File</span>
                          </div>
                        )}
                        {selected.includes(file.path) && (
                          <div className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg animate-bounce z-20 border-2 border-white/40">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="text-white font-extrabold text-base truncate w-full drop-shadow-md mt-2 group-hover:text-cyan-300 transition-colors duration-200 font-mono">{file.name}</h4>
                      <p className="text-cyan-200 text-xs mt-1 font-mono tracking-wide">
                        {file.type === "file" ? formatBytes(file.size) : ""}
                      </p>
                    </div>
                    {/* Fancy hover effect */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-cyan-400/10 via-blue-400/10 to-transparent"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-cyan-400/10">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.path}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${selected.includes(file.path) ? 'bg-cyan-900/10 animate-glow' : 'hover:bg-cyan-900/10'}`}
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
                      <span className="text-white truncate font-mono">{file.name}</span>
                    </div>

                    <div className="col-span-2 text-cyan-300 flex items-center font-mono">
                      {file.type === "file" ? formatBytes(file.size) : "--"}
                    </div>

                    <div className="col-span-2 text-cyan-300 flex items-center font-mono">
                      <FiClock className="w-4 h-4 mr-2" />
                      {file.lastModified ? formatDate(file.lastModified) : "--"}
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      {file.type === "file" && (
                        <button
                          className="p-2 rounded-lg bg-gray-700 hover:bg-cyan-800 text-cyan-400 hover:text-white transition-colors shadow"
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
                        className="p-2 rounded-lg bg-gray-700 hover:bg-red-800 text-cyan-400 hover:text-red-400 transition-colors shadow"
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
          className="p-4 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all animate-glow"
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

      {/* Custom CSS for attractive UI */}
      <style jsx global>{`
        .glassmorphism {
          background: rgba(16, 24, 39, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .drop-shadow-neon {
          text-shadow: 0 0 8px #22d3ee, 0 0 16px #2563eb;
        }
        .animate-glow {
          animation: glowPulse 2.5s infinite alternate;
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 0px #22d3ee44, 0 0 0px #2563eb33; }
          100% { box-shadow: 0 0 16px #22d3ee88, 0 0 32px #2563eb55; }
        }
        .animate-shake {
          animation: shake 0.4s;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.5s;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-progress {
          animation: progressBar 1.2s linear infinite;
        }
        @keyframes progressBar {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .font-mono {
          font-family: 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
        }
      `}</style>
    </div>
  )
};

export default ExplorerPage;