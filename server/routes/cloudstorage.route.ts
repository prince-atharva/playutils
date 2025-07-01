import express from 'express';
import {
  createS3Connection,
  getUserConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
  testConnection,
  getBucketMetrics,
  getBucketContents,
  deleteS3Object,
  uploadS3File,
  createS3Folder,
  renameS3Object,
  downloadS3File,
  previewS3File
} from '../controller/cloudstorage.controller';
import { authenticate } from '../middleware/authenticate';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

router.post('/createS3Connection', authenticate, createS3Connection);
router.get('/S3Connections', authenticate, getUserConnections);
router.get('/S3Connections/:id', authenticate, getConnectionById);
router.put('/S3Connections/:id', authenticate, updateConnection);
router.delete('/S3Connections/:id', authenticate, deleteConnection);
router.get('/S3Connections/:id/test', authenticate, testConnection);
router.get('/S3Connections/:id/metrics', authenticate, getBucketMetrics);
router.get('/S3Connections/:id/contents', authenticate, getBucketContents);
router.delete('/S3Connections/:id/object', authenticate, deleteS3Object);
router.post('/S3Connections/:id/upload', authenticate, upload.single('file'), uploadS3File);
router.post('/S3Connections/:id/folder', authenticate, createS3Folder);
router.post('/S3Connections/:id/rename', authenticate, renameS3Object);
router.get('/S3Connections/:id/download', authenticate, downloadS3File);
router.get('/S3Connections/:id/preview', authenticate, previewS3File);

export default router;