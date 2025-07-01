import { ICloudStorage } from '../../../server/model/cloudstorage.model';
import { api } from '../axios';
import type { AxiosResponse } from 'axios';

export interface S3ConnectionData {
  name: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export interface BucketMetrics {
  bucket: string;
  region: string;
  totalSize: number;
  objectCount: number;
  lastModified: Date | null;
  recentObjects: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
}

export interface BucketContents {
  bucket: string;
  prefix: string;
  files: Array<{
    key: string;
    size: number;
    lastModified: Date;
    etag: string;
    storageClass?: string;
  }>;
  folders: Array<{
    prefix: string;
  }>;
  isTruncated: boolean;
  continuationToken?: string;
}

export interface TestConnectionResult {
  isAuthorized: boolean;
  bucketExists: boolean;
  buckets: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const CloudStorageAPI = {
  createConnection: (data: S3ConnectionData): Promise<ApiResponse<ICloudStorage>> =>
    api.post<ApiResponse<ICloudStorage>>('/cloudStorage/createS3Connection', data),

  getConnections: (): Promise<ApiResponse<{ count: number; connections: ICloudStorage[] }>> =>
    api.get<ApiResponse<{ count: number; connections: ICloudStorage[] }>>('/cloudStorage/S3Connections'),

  getConnection: (id: string): Promise<ApiResponse<ICloudStorage>> =>
    api.get<ApiResponse<ICloudStorage>>(`/cloudStorage/S3Connections/${id}`),

  updateConnection: (id: string, data: Partial<S3ConnectionData>): Promise<ApiResponse<ICloudStorage>> =>
    api.put<ApiResponse<ICloudStorage>>(`/cloudStorage/S3Connections/${id}`, data),

  deleteConnection: (id: string): Promise<ApiResponse> =>
    api.delete<ApiResponse>(`/cloudStorage/S3Connections/${id}`),

  testConnection: (id: string): Promise<ApiResponse<TestConnectionResult>> =>
    api.get<ApiResponse<TestConnectionResult>>(`/cloudStorage/S3Connections/${id}/test`),

  getBucketMetrics: (id: string): Promise<ApiResponse<BucketMetrics>> =>
    api.get<ApiResponse<BucketMetrics>>(`/cloudStorage/S3Connections/${id}/metrics`),

  getBucketContents: (
    id: string,
    params?: {
      prefix?: string;
      delimiter?: string;
      maxKeys?: number;
      continuationToken?: string;
    }
  ): Promise<ApiResponse<BucketContents>> =>
    api.get<ApiResponse<BucketContents>>(`/cloudStorage/S3Connections/${id}/contents`, { params }),

  deleteFile: (id: string, key: string, type: 'file' | 'folder'): Promise<ApiResponse> =>
    api.delete<ApiResponse>(`/cloudStorage/S3Connections/${id}/object`, { data: { key, type } }),

  uploadFile: (id: string, file: File, path: string): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    return api.post<ApiResponse>(`/cloudStorage/S3Connections/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createFolder: (id: string, path: string): Promise<ApiResponse> =>
    api.post<ApiResponse>(`/cloudStorage/S3Connections/${id}/folder`, { path }),

  renameObject: (id: string, oldPath: string, newPath: string): Promise<ApiResponse> =>
    api.post<ApiResponse>(`/cloudStorage/S3Connections/${id}/rename`, { oldPath, newPath }),

  previewFile: (id: string, path: string): Promise<string> =>
    api.get(`/cloudStorage/S3Connections/${id}/preview`, { params: { path }, responseType: 'text' }).then((response: any) => response.data),
};