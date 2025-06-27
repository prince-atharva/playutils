import { S3Client } from '@aws-sdk/client-s3';

interface S3ClientConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function createS3Client({ region, accessKeyId, secretAccessKey }: S3ClientConfig): S3Client {
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}
