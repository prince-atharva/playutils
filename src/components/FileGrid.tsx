import React from "react";
import FileCard from "./FileCard";
import Loading from "./Loading";
import type { FileItem } from "../types/file";

export default function FileGrid({ files, loading, onFileClick, onRename, onDelete, onDownload, onPreview }: { files: FileItem[], loading: boolean, onFileClick: (file: FileItem) => void, onRename: (file: FileItem) => void, onDelete: (file: FileItem) => void, onDownload: (file: FileItem) => void, onPreview: (file: FileItem) => void }) {
  if (loading) return <Loading />;
  if (!files.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-4xl mb-4">📂</span>
      <span className="text-lg">This folder is empty</span>
    </div>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {files.map(file => (
        <FileCard
          key={file.path}
          file={file}
          onClick={() => onFileClick(file)}
          onRename={() => onRename(file)}
          onDelete={() => onDelete(file)}
          onDownload={() => onDownload(file)}
          onPreview={() => onPreview(file)}
        />
      ))}
    </div>
  );
} 