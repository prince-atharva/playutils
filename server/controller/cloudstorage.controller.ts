import { Request, Response } from "express";
import CloudStorage, { CloudStorageStatus } from "../model/cloudstorage.model";
import S3Service, { getS3ObjectMetadata, getS3ObjectRange } from "../shared/s3/s3Service";
import { S3Credentials } from "../shared/s3/s3Config";
import fs from 'fs';
import path from 'path';

export const createS3Connection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, accessKey, secretKey, bucket, region } = req.body;
    const userId = req.user.id;
    const requiredFields = ['name', 'accessKey', 'secretKey', 'bucket', 'region'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
      return;
    }
    const existingConnection = await CloudStorage.findOne({
      userId,
      accessKey,
      secretKey,
      bucket,
      region,
    });
    if (existingConnection) {
      res.status(409).json({
        success: false,
        message: "An S3 connection with these credentials already exists.",
      });
      return;
    }
    const credentials: S3Credentials = {
      region,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      bucketName: bucket,
    };
    const connectionTest = await S3Service.testS3Connection({ credentials });
    if (!connectionTest.isAuthorized) {
      res.status(404).json({
        success: false,
        message: "Failed to authenticate with S3. Please check your credentials.",
        details: connectionTest.error,
      });
      return;
    }
    if (!connectionTest.buckets.includes(bucket)) {
      res.status(404).json({
        success: false,
        message: `Bucket '${bucket}' not found in region ${region}. Available buckets: ${connectionTest.buckets.join(', ') || 'none'}`,
      });
      return;
    }
    const newConnection = await CloudStorage.create({
      userId,
      name,
      accessKey,
      secretKey,
      bucket,
      region,
      status: CloudStorageStatus.CONNECTED,
    });
    res.status(201).json({
      success: true,
      message: "S3 connection created successfully",
      data: {
        id: newConnection._id,
        name: newConnection.name,
        bucket: newConnection.bucket,
        region: newConnection.region,
        status: newConnection.status,
        createdAt: newConnection.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating S3 connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating S3 connection",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

export const getUserConnections = async (req: Request, res: Response): Promise<void> => {
  try {
    const connections = await CloudStorage.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      data: {
        connections,
        count: connections.length
      },
    });
  } catch (error) {
    console.error("Error fetching user connections:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching connections",
    });
  }
};

export const getConnectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await CloudStorage.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
    if (!connection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error("Error fetching connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching connection",
    });
  }
};

export const updateConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, accessKey, secretKey, bucket, region } = req.body;
    const userId = req.user.id;
    const existingConnection = await CloudStorage.findOne({ _id: id, userId });
    if (!existingConnection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    const updatedCredentials: S3Credentials = {
      region: region || existingConnection.region,
      accessKeyId: accessKey || existingConnection.accessKey,
      secretAccessKey: secretKey || existingConnection.secretKey,
      bucketName: bucket || existingConnection.bucket,
    };
    const connectionTest = await S3Service.testS3Connection({
      credentials: updatedCredentials
    });
    if (!connectionTest.isAuthorized) {
      res.status(404).json({
        success: false,
        message: "Failed to authenticate with updated credentials",
        details: connectionTest.error,
      });
      return;
    }
    const targetBucket = bucket || existingConnection.bucket;
    if (!connectionTest.buckets.includes(targetBucket)) {
      res.status(404).json({
        success: false,
        message: `Bucket '${targetBucket}' not found in region ${updatedCredentials.region}`,
      });
      return;
    }
    const updatedConnection = await CloudStorage.findByIdAndUpdate(
      id,
      {
        name: name || existingConnection.name,
        accessKey: updatedCredentials.accessKeyId,
        secretKey: updatedCredentials.secretAccessKey,
        bucket: targetBucket,
        region: updatedCredentials.region,
        status: CloudStorageStatus.CONNECTED,
      },
      { new: true }
    )
    res.status(200).json({
      success: true,
      message: "Connection updated successfully",
      data: updatedConnection,
    });
  } catch (error) {
    console.error("Error updating connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating connection",
    });
  }
};

export const deleteConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deletedConnection = await CloudStorage.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!deletedConnection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Connection deleted successfully",
      data: {
        id: deletedConnection._id,
        name: deletedConnection.name,
      },
    });
  } catch (error) {
    console.error("Error deleting connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting connection",
    });
  }
};

export const testConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const testResult = await S3Service.testS3Connection({ credentials });
    const newStatus = testResult.isAuthorized &&
      testResult.buckets.includes(connection.bucket)
      ? CloudStorageStatus.CONNECTED
      : CloudStorageStatus.FAILED;
    await CloudStorage.findByIdAndUpdate(id, { status: newStatus });
    if (newStatus === CloudStorageStatus.FAILED) {
      res.status(200).json({
        success: false,
        message: "Connection test failed",
        details: testResult.error || "Bucket not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Connection test successful",
      data: {
        isAuthorized: true,
        bucketExists: true,
        buckets: testResult.buckets,
      },
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while testing connection",
    });
  }
};

export const getBucketMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const [stats, objects] = await Promise.all([
      S3Service.getS3BucketStats({ credentials }),
      S3Service.listS3Files({
        credentials,
        maxKeys: 5,
      }),
    ]);
    res.status(200).json({
      success: true,
      data: {
        bucket: connection.bucket,
        region: connection.region,
        totalSize: stats.size,
        objectCount: stats.count,
        lastModified: stats.lastModified,
        recentObjects: objects.files.slice(0, 5).map(obj => ({
          key: obj.key,
          size: obj.size,
          lastModified: obj.lastModified,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching bucket metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bucket metrics",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

export const getBucketContents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { prefix, delimiter, maxKeys, continuationToken } = req.query;
    const userId = req.user.id;
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({
        success: false,
        message: "Connection not found",
      });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const result = await S3Service.listS3Files({
      credentials,
      prefix: prefix as string | undefined,
      delimiter: delimiter as string | undefined,
      maxKeys: maxKeys ? parseInt(maxKeys as string) : undefined,
      continuationToken: continuationToken as string | undefined,
    });
    res.status(200).json({
      success: true,
      data: {
        bucket: connection.bucket,
        prefix: prefix || '',
        files: result.files,
        folders: result.folders,
        isTruncated: result.isTruncated,
        continuationToken: result.continuationToken,
      },
    });
  } catch (error) {
    console.error("Error fetching bucket contents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bucket contents",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

export const deleteS3Object = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { key, type } = req.body;
    const userId = req.user.id;
    if (!key || !type) {
      res.status(400).json({ success: false, message: "Missing key or type in request body" });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({ success: false, message: "Connection not found" });
      return;
    }
    const credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    if (type === "file") {
      await S3Service.deleteFromS3({ credentials, key });
    } else if (type === "folder") {
      await S3Service.deleteS3Folder({ credentials, prefix: key });
    } else {
      res.status(400).json({ success: false, message: "Invalid type. Must be 'file' or 'folder'" });
      return;
    }
    res.status(200).json({ success: true, message: `${type === "folder" ? "Folder" : "File"} deleted successfully` });
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    res.status(500).json({ success: false, message: "Internal server error while deleting S3 object", error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined });
  }
};

export const uploadS3File = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { path: s3Path } = req.body;
    if (!req.file) {
      console.error('[UPLOAD] No file uploaded');
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    if (req.file.size === 0) {
      console.error('[UPLOAD] Uploaded file is empty');
      res.status(400).json({ success: false, message: 'Uploaded file is empty' });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      console.error('[UPLOAD] Connection not found for id', id);
      res.status(404).json({ success: false, message: 'Connection not found' });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const tempFilePath = req.file.path;
    const key = s3Path ? `${s3Path.replace(/\/$/, '')}/${req.file.originalname}` : req.file.originalname;
    await S3Service.uploadToS3({
      credentials,
      filePath: tempFilePath,
      key,
      contentType: req.file.mimetype,
    });
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error('[UPLOAD] Failed to remove temp file:', tempFilePath, err);
      else console.log('[UPLOAD] Temp file removed:', tempFilePath);
    });
    res.status(200).json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('[UPLOAD] Upload failed:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: (error as Error).message });
  }
};

export const createS3Folder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { path: folderPath } = req.body;
    if (!folderPath) {
      res.status(400).json({ success: false, message: 'No folder path provided' });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found' });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    await S3Service.createS3Folder({ credentials, prefix });
    res.status(200).json({ success: true, message: 'Folder created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Create folder failed', error: (error as Error).message });
  }
};

export const renameS3Object = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      res.status(400).json({ success: false, message: 'Missing oldPath or newPath' });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id, userId });
    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found' });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    await S3Service.copyS3File({ credentials, sourceKey: oldPath, destinationKey: newPath });
    await S3Service.deleteFromS3({ credentials, key: oldPath });
    res.status(200).json({ success: true, message: 'Renamed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Rename failed', error: (error as Error).message });
  }
};

export const downloadS3File = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { path: s3Path } = req.query;
    console.log('[DOWNLOAD] id:', id, 's3Path:', s3Path);

    if (!s3Path || typeof s3Path !== 'string') {
      console.error('[DOWNLOAD] No file path provided');
      res.status(400).json({ success: false, message: 'No file path provided' });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id });
    if (!connection) {
      console.error('[DOWNLOAD] Connection not found for id', id);
      res.status(404).json({ success: false, message: 'Connection not found' });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    try {
      const url = await S3Service.getDownloadUrl({ credentials, key: s3Path });
      res.redirect(url);
    } catch (err) {
      console.error('[DOWNLOAD] Failed to get download URL for key', s3Path, err);
      res.status(404).json({ success: false, message: 'File not found or cannot generate download URL' });
    }
  } catch (error) {
    console.error('[DOWNLOAD] Error:', error);
    res.status(500).json({ success: false, message: 'Download failed', error: (error as Error).message });
  }
};

// Helper to infer content type from file extension
function inferContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    case '.txt': return 'text/plain';
    case '.md': return 'text/markdown';
    case '.csv': return 'text/csv';
    case '.json': return 'application/json';
    case '.js': return 'application/javascript';
    case '.ts': return 'application/typescript';
    case '.css': return 'text/css';
    case '.html':
    case '.htm': return 'text/html';
    default: return 'application/octet-stream';
  }
}

export const previewS3File = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { path: s3Path } = req.query;
    if (!s3Path || typeof s3Path !== 'string') {
      res.status(400).json({ success: false, message: 'No file path provided' });
      return;
    }
    const connection = await CloudStorage.findOne({ _id: id });
    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found' });
      return;
    }
    const credentials: S3Credentials = {
      region: connection.region,
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
      bucketName: connection.bucket,
    };
    const { stream, contentType, contentLength } = await S3Service.getS3ObjectStream({ credentials, key: s3Path });
    // Fallback: infer content type if missing
    const finalContentType = contentType || inferContentType(s3Path);
    res.setHeader('Content-Type', finalContentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Preview failed', error: (error as Error).message });
  }
};