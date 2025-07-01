export interface FileItem {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  type: "file" | "folder";
  contentType?: string;
  sizeLabel?: string;
  lastModifiedLabel?: string;
  previewUrl?: string;
  previewText?: string;
} 