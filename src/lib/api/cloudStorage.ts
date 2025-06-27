import { ICloudStorage } from '../../../server/model/cloudstorage.model';
import { api } from '../axios';

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
  recentObjects: {
    key: string;
    size: number;
    lastModified: Date;
  }[];
}

export interface BucketContents {
  bucket: string;
  prefix: string;
  files: {
    key: string;
    size: number;
    lastModified: Date;
    etag: string;
    storageClass?: string;
  }[];
  folders: {
    prefix: string;
  }[];
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
    api.get<ApiResponse<BucketContents>>(`/cloudStorage/S3Connections/${id}/contents`, { params })
};