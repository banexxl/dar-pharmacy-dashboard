import type { NextApiRequest, NextApiResponse } from 'next';
import {
     S3Client,
     PutObjectCommand,
     DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
});

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '4mb',
          },
     },
};

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export const extractInfoFromUrl = (url: string) => {
     const splitUrl = url.split('.com/')[1].split('?')[0];
     return decodeURIComponent(splitUrl);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          // ------------------------
          // POST: upload image/video
          // ------------------------
          if (req.method === 'POST') {
               const { file, extension, fileName, manufacturer } = req.body;

               if (!file || !extension || !fileName || !manufacturer) {
                    return res.status(400).json({ error: 'Missing required fields' });
               }

               const imageExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];
               const videoExt = ['mp4', 'webm', 'mov', 'avi'];

               let contentType: string;
               if (imageExt.includes(extension.toLowerCase())) {
                    contentType = `image/${extension}`;
               } else if (videoExt.includes(extension.toLowerCase())) {
                    contentType = `video/${extension}`;
               } else {
                    return res.status(400).json({ error: 'Unsupported file type' });
               }

               const base64Prefix = /^data:(image|video)\/\w+;base64,/;
               const body = Buffer.from(file.replace(base64Prefix, ''), 'base64');

               const key = `slike artikla/${manufacturer}/${fileName.split('.')[0]}.${extension}`;

               await s3.send(
                    new PutObjectCommand({
                         Bucket: BUCKET,
                         Key: key,
                         Body: body,
                         ContentType: contentType,
                         // ⚠️ Remove ACL if your bucket has "Bucket owner enforced"
                         // ACL: 'public-read',
                    })
               );

               return res.status(200).json({
                    imageUrl: `https://${BUCKET}.s3.amazonaws.com/${key}`,
               });
          }

          // ------------------------
          // DELETE: delete image
          // ------------------------
          if (req.method === 'DELETE') {
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
          }

          return res.status(405).end();
     } catch (error) {
          console.error('S3 error:', error);
          return res.status(500).json({ error: 'AWS S3 operation failed' });
     }
}
