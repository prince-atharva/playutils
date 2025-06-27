import { ObjectCannedACL } from '@aws-sdk/client-s3';
import {
  S3Credentials,
  S3ConnectionResult,
  S3Object,
  S3Folder,
  S3BucketStats,
  uploadFile as uploadFileOriginal,
  deleteFile as deleteFileOriginal,
  getSignedUrlForFile as getSignedUrlForFileOriginal,
  generateUploadSignedUrl as generateUploadSignedUrlOriginal,
  listFilesWithMetadata,
  fileExists as fileExistsOriginal,
  downloadFile as downloadFileOriginal,
  getFileMetadata as getFileMetadataOriginal,
  copyFile as copyFileOriginal,
  testS3Connection as testS3ConnectionOriginal,
  createFolder as createFolderOriginal,
  deleteFolder as deleteFolderOriginal,
  listFolders as listFoldersOriginal,
  getBucketStats as getBucketStatsOriginal,
} from './s3Config';

const defaultS3Config: S3Credentials = {
  region: process.env.AWS_REGION || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucketName: process.env.AWS_BUCKET_NAME || '',
};

function withFallbackCredentials(credentials?: Partial<S3Credentials>): S3Credentials {
  return {
    ...defaultS3Config,
    ...credentials,
  };
}

export async function uploadToS3(params: {
  credentials?: Partial<S3Credentials>;
  filePath: string;
  key: string;
  contentType?: string;
  acl?: string;
}): Promise<string> {
  return uploadFileOriginal({
    credentials: withFallbackCredentials(params.credentials),
    filePath: params.filePath,
    key: params.key,
    contentType: params.contentType,
    acl: params.acl as ObjectCannedACL,
  });
}

export async function deleteFromS3(params: {
  credentials?: Partial<S3Credentials>;
  key: string;
}): Promise<void> {
  return deleteFileOriginal({
    credentials: withFallbackCredentials(params.credentials),
    key: params.key,
  });
}

export async function getDownloadUrl(params: {
  credentials?: Partial<S3Credentials>;
  key: string;
  expiresIn?: number;
}): Promise<string> {
  return getSignedUrlForFileOriginal({
    credentials: withFallbackCredentials(params.credentials),
    key: params.key,
    expiresIn: params.expiresIn,
  });
}

export async function getUploadUrl(params: {
  credentials?: Partial<S3Credentials>;
  key: string;
  contentType?: string;
  expiresIn?: number;
  acl?: string;
}): Promise<string> {
  return generateUploadSignedUrlOriginal({
    credentials: withFallbackCredentials(params.credentials),
    key: params.key,
    contentType: params.contentType,
    expiresIn: params.expiresIn,
    acl: params.acl as ObjectCannedACL,
  });
}

export async function listS3Files(params: {
  credentials?: Partial<S3Credentials>;
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
}): Promise<{
  files: S3Object[];
  folders: S3Folder[];
  continuationToken?: string;
  isTruncated: boolean;
}> {
  return listFilesWithMetadata({
    credentials: withFallbackCredentials(params.credentials),
    prefix: params.prefix,
    delimiter: params.delimiter,
    maxKeys: params.maxKeys,
    continuationToken: params.continuationToken,
  });
}

export async function createS3Folder(params: {
  credentials?: Partial<S3Credentials>;
  prefix: string;
}): Promise<void> {
  return createFolderOriginal({
    credentials: withFallbackCredentials(params.credentials),
    prefix: params.prefix,
  });
}

export async function deleteS3Folder(params: {
  credentials?: Partial<S3Credentials>;
  prefix: string;
}): Promise<void> {
  return deleteFolderOriginal({
    credentials: withFallbackCredentials(params.credentials),
    prefix: params.prefix,
  });
}

export async function listS3Folders(params: {
  credentials?: Partial<S3Credentials>;
  prefix?: string;
}): Promise<S3Folder[]> {
  return listFoldersOriginal({
    credentials: withFallbackCredentials(params.credentials),
    prefix: params.prefix,
  });
}

export async function checkFileExists(params: {
  credentials?: Partial<S3Credentials>;
  key: string;
}): Promise<boolean> {
  return fileExistsOriginal({
    credentials: withFallbackCredentials(params.credentials),
    key: params.key,
  });
}

export async function getS3FileMetadata(params: {
  credentials?: Partial<S3Credentials>;
  key: string;
}): Promise<Record<string, any>> {
  return getFileMetadataOriginal({
    credentials: withFallbackCredentials(params.credentials),
    key: params.key,
  });
}

export async function copyS3File(params: {
  credentials?: Partial<S3Credentials>;
  sourceKey: string;
  destinationKey: string;
}): Promise<void> {
  return copyFileOriginal({
    credentials: withFallbackCredentials(params.credentials),
    sourceKey: params.sourceKey,
    destinationKey: params.destinationKey,
  });
}

export async function getS3BucketStats(params: {
  credentials?: Partial<S3Credentials>;
}): Promise<S3BucketStats> {
  return getBucketStatsOriginal({
    credentials: withFallbackCredentials(params.credentials),
  });
}

export async function testS3Connection(params: {
  credentials?: Partial<S3Credentials>;
}): Promise<S3ConnectionResult> {
  return testS3ConnectionOriginal({
    credentials: withFallbackCredentials(params.credentials),
  });
}

export const S3Service = {
  uploadToS3,
  deleteFromS3,
  getDownloadUrl,
  getUploadUrl,
  listS3Files,
  createS3Folder,
  deleteS3Folder,
  listS3Folders,
  checkFileExists,
  getS3FileMetadata,
  copyS3File,
  getS3BucketStats,
  testS3Connection,
};

export default S3Service;