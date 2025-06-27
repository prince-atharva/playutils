import express from 'express';
import {
  createS3Connection,
  getUserConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
  testConnection,
  getBucketMetrics,
  getBucketContents
} from '../controller/cloudstorage.controller';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

router.post('/createS3Connection', authenticate, createS3Connection);
router.get('/S3Connections', authenticate, getUserConnections);
router.get('/S3Connections/:id', authenticate, getConnectionById);
router.put('/S3Connections/:id', authenticate, updateConnection);
router.delete('/S3Connections/:id', authenticate, deleteConnection);
router.get('/S3Connections/:id/test', authenticate, testConnection);
router.get('/S3Connections/:id/metrics', authenticate, getBucketMetrics);
router.get('/S3Connections/:id/contents', authenticate, getBucketContents);

export default router;