// Compatibility handler used by the App Router adapter.
import type { NextApiRequest, NextApiResponse } from 'next';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/utils/aws/aws-s3';

// Keep your body size limit
export const config = {
     api: {
          bodyParser: {
               sizeLimit: '4mb',
          },
     },
};

type UploadBody = {
     file: string; // base64 data URL
     title?: string;
     extension: string;
     fileName: string;
     manufacturer: string;
};

function buildContentType(extension: string): string | null {
     const ext = extension.toLowerCase();

     // Normalize jpg -> jpeg for content-type correctness
     if (ext === 'jpg') return 'image/jpeg';

     const imageExtensions = ['png', 'jpeg', 'gif', 'webp', 'avif'];
     const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];

     if (imageExtensions.includes(ext)) return `image/${ext}`;
     if (videoExtensions.includes(ext)) {
          // mov/avi aren’t always video/<ext> officially, but keep it simple.
          // If you want stricter mapping, we can add it.
          return `video/${ext}`;
     }

     return null;
}

function stripDataUrlPrefix(dataUrl: string): string {
     // Handles image/* and video/* prefixes generically
     return dataUrl.replace(/^data:[^;]+;base64,/, '');
}

function encodeS3KeyForUrl(key: string): string {
     // Encode each segment so slashes stay slashes, spaces become %20, etc.
     return key.split('/').map(encodeURIComponent).join('/');
}

export function extractKeyFromS3Url(url: string): string {
     // Supports URLs like:
     // https://bucket.s3.amazonaws.com/key...
     // https://bucket.s3.eu-central-1.amazonaws.com/key...
     // and strips query params
     const afterHost = url.split('.amazonaws.com/')[1] ?? url.split('.com/')[1];
     if (!afterHost) throw new Error('Invalid S3 URL');
     const rawKey = afterHost.split('?')[0];
     return decodeURIComponent(rawKey);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const bucket = process.env.AWS_S3_BUCKET_NAME;
     const region = process.env.AWS_REGION;

     if (!bucket || !region) {
          return res.status(500).json({ error: 'Server misconfigured: missing AWS_S3_BUCKET_NAME or AWS_REGION' });
     }

     // ✅ UPLOAD
     if (req.method === 'POST') {
          try {
               const { file, extension, fileName, manufacturer } = req.body as UploadBody;

               if (!file || !extension || !fileName || !manufacturer) {
                    return res.status(400).json({ error: 'Missing file, extension, fileName, or manufacturer' });
               }

               const contentType = buildContentType(extension);
               if (!contentType) {
                    return res.status(400).json({ error: 'Unsupported file type' });
               }

               const base64 = stripDataUrlPrefix(file);
               const body = Buffer.from(base64, 'base64');

               // IMPORTANT: key has a space in "slike artikla" — that’s OK in S3,
               // but URLs must be encoded. We'll encode when generating the URL.
               const key = `slike artikla/${manufacturer}/${fileName.split('.')[0]}.${extension}`;

               await s3.send(
                    new PutObjectCommand({
                         Bucket: bucket,
                         Key: key,
                         Body: body,
                         ContentType: contentType,
                         // Note: ACL requires bucket/object ACLs enabled. Many buckets block ACLs.
                         // If your bucket blocks ACLs (recommended), REMOVE this line.
                         ACL: 'public-read',
                    })
               );

               // Construct a consistent regional URL
               const url = `https://${bucket}.s3.${region}.amazonaws.com/${encodeS3KeyForUrl(key)}`;

               return res.status(200).json({ imageUrl: url, key });
          } catch (error) {
               console.error('Error uploading file:', error);
               return res.status(500).json({ error: 'Failed to upload file to S3' });
          }
     }

     // ✅ DELETE
     if (req.method === 'DELETE') {
          try {
               // You can send either:
               // { "url": "https://..." } OR { "key": "slike artikla/..." }
               const body = req.body as { url?: string; key?: string };

               const key = body.key ?? (body.url ? extractKeyFromS3Url(body.url) : null);

               if (!key) {
                    return res.status(400).json({ error: 'Missing key or url' });
               }

               await s3.send(
                    new DeleteObjectCommand({
                         Bucket: bucket,
                         Key: key,
                    })
               );

               return res.status(200).json({ message: 'Image deleted successfully', key });
          } catch (error) {
               console.error('Error deleting image:', error);
               return res.status(500).json({ error: 'Failed to delete image from S3' });
          }
     }

     return res.status(405).end();
}
