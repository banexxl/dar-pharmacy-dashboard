import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          // NOTE: you used AWS_S3_ACCESS_KEY / AWS_S3_SECRET_KEY in this file
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
     },
});

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '2mb',
          },
     },
};

export const extractInfoFromUrl = (url: string) => {
     const splitUrl = url.split('.com/')[1].split('?')[0];
     return decodeURIComponent(splitUrl);
};

function getYMD() {
     const now = new Date();
     const day = String(now.getDate()).padStart(2, '0');
     const month = String(now.getMonth() + 1).padStart(2, '0');
     const year = String(now.getFullYear());
     return { day, month, year };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
     const { day, month, year } = getYMD();

     if (req.method === 'POST') {
          try {
               const { file, extension, fileName } = req.body;

               if (!file || !extension || !fileName) {
                    return res.status(400).json({ error: 'Missing file, extension, or fileName' });
               }

               // Accepts data URLs (recommended) or raw base64
               const base64 = String(file).includes('base64,')
                    ? String(file).split('base64,').pop()!
                    : String(file);

               const decodedFile = Buffer.from(base64, 'base64');

               const key = `kanban/${year}/${month}/${day}/${String(fileName).split('.')[0]}.${extension}`;

               // Better content type than "file"
               const contentType =
                    extension === 'png' ? 'image/png' :
                         extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
                              extension === 'webp' ? 'image/webp' :
                                   extension === 'gif' ? 'image/gif' :
                                        'application/octet-stream';

               await s3.send(
                    new PutObjectCommand({
                         Bucket: BUCKET,
                         Key: key,
                         Body: decodedFile,
                         ContentType: contentType,
                         // ⚠️ If your bucket has Object Ownership = "Bucket owner enforced", ACL will fail.
                         // ACL: 'public-read',
                    })
               );

               // Return a URL (same idea as before)
               return res.status(200).json({
                    imageUrl: `https://${BUCKET}.s3.amazonaws.com/${key}`,
               });
          } catch (error) {
               console.error('Error uploading image:', error);
               return res.status(500).json({ error: 'Failed to upload image to S3' });
          }
     }

     if (req.method === 'DELETE') {
          try {
               const awsUrl = extractInfoFromUrl(req.body);

               if (!awsUrl) {
                    return res.status(400).json({ error: 'Missing key' });
               }

               await s3.send(
                    new DeleteObjectCommand({
                         Bucket: BUCKET,
                         Key: awsUrl,
                    })
               );

               return res.status(200).json({ message: 'Image deleted successfully' });
          } catch (error) {
               console.error('Error deleting image:', error);
               return res.status(500).json({ error: 'Failed to delete image from S3' });
          }
     }

     return res.status(405).end();
}
