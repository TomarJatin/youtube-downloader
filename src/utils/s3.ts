import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(filePath: string, contentType: string = 'video/mp4'): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const key = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${contentType.split('/')[1]}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      })
    );

    // Delete the local file after successful upload
    await fs.unlink(filePath);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
} 