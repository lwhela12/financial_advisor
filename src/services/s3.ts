import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || 'us-east-1';

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: !!endpoint,
});

export async function uploadStatement(
  userId: string,
  file: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    size: number;
  },
) {
  const datePrefix = format(new Date(), 'yyyy/MM/dd');
  const extension = file.filename.split('.').pop() ?? '';
  const objectKey = `${userId}/${datePrefix}/${uuidv4()}.${extension}`;

  const input: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET,
    Key: objectKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentLength: file.size,
    ACL: 'private',
  };

  // Use high-level Upload helper for multipart for >5MB
  const upload = new Upload({ client: s3, params: input });

  await upload.done();

  return objectKey;
}
