import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  ListBucketsCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { createS3Client } from './s3Client';

export interface S3Credentials {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint?: string;
}

export interface S3ConnectionResult {
  isAuthorized: boolean;
  buckets: string[];
  error?: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  storageClass?: string;
}

export interface S3Folder {
  prefix: string;
}

export interface S3BucketStats {
  size: number;
  count: number;
  lastModified: Date | null;
}

export interface S3ListResult {
  files: S3Object[];
  folders: S3Folder[];
  continuationToken?: string;
  isTruncated: boolean;
}

function validateCredentials(credentials: S3Credentials): void {
  const required = ['region', 'accessKeyId', 'secretAccessKey', 'bucketName'];
  for (const key of required) {
    if (!credentials[key as keyof S3Credentials]) {
      throw new Error(`Missing S3 credential: ${key}`);
    }
  }
}

async function listAllObjectsInFolder(
  credentials: S3Credentials,
  prefix: string
): Promise<{ Key?: string }[]> {
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);
  let continuationToken: string | undefined;
  let allObjects: { Key?: string }[] = [];

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const response = await s3.send(command);

    if (response.Contents) {
      allObjects = allObjects.concat(response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return allObjects;
}

export async function uploadFile({
  credentials,
  filePath,
  key,
  contentType = 'application/octet-stream',
  acl = 'private',
}: {
  credentials: S3Credentials;
  filePath: string;
  key: string;
  contentType?: string;
  acl?: ObjectCannedACL;
}): Promise<string> {
  validateCredentials(credentials);
  const { bucketName, region } = credentials;
  const s3 = createS3Client(credentials);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
    ACL: acl,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${bucketName}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteFile({
  credentials,
  key,
}: {
  credentials: S3Credentials;
  key: string;
}): Promise<void> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  } catch (err) {
    throw new Error(`Failed to delete file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getSignedUrlForFile({
  credentials,
  key,
  expiresIn = 3600,
  responseContentDisposition,
}: {
  credentials: S3Credentials;
  key: string;
  expiresIn?: number;
  responseContentDisposition?: string;
}): Promise<string> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new GetObjectCommand({ 
      Bucket: bucketName, 
      Key: key,
      ...(responseContentDisposition ? { ResponseContentDisposition: responseContentDisposition } : {})
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (err) {
    throw new Error(`Failed to generate signed URL: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function generateUploadSignedUrl({
  credentials,
  key,
  contentType = 'application/octet-stream',
  expiresIn = 3600,
  acl = 'private',
}: {
  credentials: S3Credentials;
  key: string;
  contentType?: string;
  expiresIn?: number;
  acl?: ObjectCannedACL;
}): Promise<string> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      ACL: acl,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (err) {
    throw new Error(`Failed to generate upload URL: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function fileExists({
  credentials,
  key,
}: {
  credentials: S3Credentials;
  key: string;
}): Promise<boolean> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw new Error(`Failed to check file existence: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function downloadFile({
  credentials,
  key,
  downloadPath,
}: {
  credentials: S3Credentials;
  key: string;
  downloadPath: string;
}): Promise<void> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error('No file body returned from S3');
    }

    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(downloadPath);
      (response.Body as NodeJS.ReadableStream)
        .pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  } catch (err) {
    throw new Error(`Failed to download file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getFileMetadata({
  credentials,
  key,
}: {
  credentials: S3Credentials;
  key: string;
}): Promise<Record<string, any>> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const response = await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
      etag: response.ETag,
      storageClass: response.StorageClass,
    };
  } catch (err) {
    throw new Error(`Failed to get metadata: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function copyFile({
  credentials,
  sourceKey,
  destinationKey,
}: {
  credentials: S3Credentials;
  sourceKey: string;
  destinationKey: string;
}): Promise<void> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${encodeURIComponent(sourceKey)}`,
        Key: destinationKey,
      })
    );
  } catch (err) {
    throw new Error(`Failed to copy file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function testS3Connection({ credentials }: { credentials: S3Credentials }): Promise<S3ConnectionResult> {
  validateCredentials(credentials);
  const s3 = createS3Client(credentials);

  try {
    const result = await s3.send(new ListBucketsCommand({}));
    return {
      isAuthorized: true,
      buckets: result.Buckets?.map(b => b.Name || '') || [],
    };
  } catch (err: any) {
    if (err.name === 'AccessDenied' || err.$metadata?.httpStatusCode === 403) {
      return { isAuthorized: false, buckets: [], error: 'Access denied' };
    }
    return {
      isAuthorized: false,
      buckets: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function createFolder({
  credentials,
  prefix,
}: {
  credentials: S3Credentials;
  prefix: string;
}): Promise<void> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);
  const folderKey = prefix.endsWith('/') ? prefix : `${prefix}/`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: folderKey,
      })
    );
  } catch (err) {
    throw new Error(`Failed to create folder: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteFolder({
  credentials,
  prefix,
}: {
  credentials: S3Credentials;
  prefix: string;
}): Promise<void> {
  validateCredentials(credentials);
  const folderKey = prefix.endsWith('/') ? prefix : `${prefix}/`;

  try {
    const objects = await listAllObjectsInFolder(credentials, folderKey);
    const { bucketName } = credentials;
    const s3 = createS3Client(credentials);

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objects[0].Key,
        })
      );
    }
  } catch (err) {
    throw new Error(`Failed to delete folder: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function listFolders({
  credentials,
  prefix = '',
  delimiter = '/',
}: {
  credentials: S3Credentials;
  prefix?: string;
  delimiter?: string;
}): Promise<S3Folder[]> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: delimiter,
    });
    const response = await s3.send(command);

    return response.CommonPrefixes?.map(p => ({ prefix: p.Prefix || '' })) || [];
  } catch (err) {
    throw new Error(`Failed to list folders: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getBucketSize({
  credentials,
}: {
  credentials: S3Credentials;
}): Promise<number> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);
  let totalSize = 0;
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      const response = await s3.send(command);

      if (response.Contents) {
        totalSize += response.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return totalSize;
  } catch (err) {
    throw new Error(`Failed to get bucket size: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getObjectsCount({
  credentials,
}: {
  credentials: S3Credentials;
}): Promise<number> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);
  let totalCount = 0;
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      const response = await s3.send(command);

      totalCount += response.KeyCount || 0;
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return totalCount;
  } catch (err) {
    throw new Error(`Failed to get object count: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getLastModified({
  credentials,
}: {
  credentials: S3Credentials;
}): Promise<Date | null> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });
    const response = await s3.send(command);

    return response.Contents?.[0]?.LastModified || null;
  } catch (err) {
    throw new Error(`Failed to get last modified: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function listFilesWithMetadata({
  credentials,
  prefix = '',
  delimiter = '/',
  maxKeys = 100,
  continuationToken,
}: {
  credentials: S3Credentials;
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
}): Promise<S3ListResult> {
  validateCredentials(credentials);
  const { bucketName } = credentials;
  const s3 = createS3Client(credentials);

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: delimiter,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });
    const response = await s3.send(command);

    return {
      files: response.Contents?.map(c => ({
        key: c.Key || '',
        size: c.Size || 0,
        lastModified: c.LastModified || new Date(),
        etag: c.ETag || '',
        storageClass: c.StorageClass,
      })) || [],
      folders: response.CommonPrefixes?.map(p => ({ prefix: p.Prefix || '' })) || [],
      continuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    };
  } catch (err) {
    throw new Error(`Failed to list files: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getBucketStats({
  credentials,
}: {
  credentials: S3Credentials;
}): Promise<S3BucketStats> {
  try {
    const [size, count, lastModified] = await Promise.all([
      getBucketSize({ credentials }),
      getObjectsCount({ credentials }),
      getLastModified({ credentials }),
    ]);

    return { size, count, lastModified };
  } catch (err) {
    throw new Error(`Failed to get bucket stats: ${err instanceof Error ? err.message : String(err)}`);
  }
}