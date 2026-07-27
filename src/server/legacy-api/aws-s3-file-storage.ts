import type { NextApiRequest, NextApiResponse } from 'next';
import { Item, ItemType } from '@/schemas/file-manager';
import {
     PutObjectCommand,
     ListObjectsV2Command,
     DeleteObjectCommand,
     DeleteObjectsCommand,
     type _Object,
} from '@aws-sdk/client-s3';
import { mapS3ObjectToItem, s3 } from '@/utils/aws/aws-s3';

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          // ------------------------------------------------
          // POST – create folder or upload file
          // ------------------------------------------------
          if (req.method === 'POST') {
               const { fileName, type, folderPath, fileContent } = req.body;

               if (type === 'folder') {
                    if (!fileName || !folderPath) {
                         return res.status(400).json({ error: 'Folder name or path not provided!' });
                    }

                    const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

                    await s3.send(
                         new PutObjectCommand({
                              Bucket: BUCKET,
                              Key: key,
                              Body: '',
                         })
                    );

                    return res.status(200).json({ folderURL: `s3://${BUCKET}/${key}` });
               }

               if (type === 'file') {
                    if (!fileName || !fileContent || !folderPath) {
                         return res.status(400).json({ error: 'File, file name, or path not provided!' });
                    }

                    const extension = fileName.split('.').pop()?.toLowerCase();
                    const contentType =
                         extension === 'pdf'
                              ? 'application/pdf'
                              : 'application/octet-stream';

                    const body = Buffer.from(
                         String(fileContent).includes('base64,')
                              ? String(fileContent).split('base64,').pop()!
                              : String(fileContent),
                         'base64'
                    );

                    await s3.send(
                         new PutObjectCommand({
                              Bucket: BUCKET,
                              Key: folderPath,
                              Body: body,
                              ContentType: contentType,
                              // ACL: 'public-read', // remove if bucket-owner-enforced
                         })
                    );

                    return res.status(200).json({ message: 'OK' });
               }

               return res.status(400).json({ error: 'Invalid type provided!' });
          }

          // ------------------------------------------------
          // PUT – upload file
          // ------------------------------------------------
          if (req.method === 'PUT') {
               const { file, fileName, fileType } = req.body;

               if (!file || !fileName || !fileType) {
                    return res.status(400).json({ error: 'File, fileName, or fileType not provided!' });
               }

               const decodedFile = Buffer.from(
                    String(file).replace(/^data:.+;base64,/, ''),
                    'base64'
               );

               await s3.send(
                    new PutObjectCommand({
                         Bucket: BUCKET,
                         Key: fileName,
                         Body: decodedFile,
                         ContentType: fileType,
                         // ACL: 'public-read',
                    })
               );

               return res.status(200).json({
                    fileURL: `https://${BUCKET}.s3.amazonaws.com/${fileName}`,
               });
          }

          // ------------------------------------------------
          // DELETE – delete folder + contents
          // ------------------------------------------------
          if (req.method === 'DELETE') {
               const { fileURL } = req.body;
               if (!fileURL) {
                    return res.status(400).json({ error: 'Missing file URL' });
               }

               const listed = await s3.send(
                    new ListObjectsV2Command({
                         Bucket: BUCKET,
                         Prefix: fileURL,
                    })
               );

               const objects =
                    listed.Contents?.filter((o: any) => o.Key).map((o: any) => ({ Key: o.Key! })) ?? [];

               if (objects.length > 0) {
                    await s3.send(
                         new DeleteObjectsCommand({
                              Bucket: BUCKET,
                              Delete: { Objects: objects },
                         })
                    );
               }

               await s3.send(
                    new DeleteObjectCommand({
                         Bucket: BUCKET,
                         Key: fileURL,
                    })
               );

               return res.status(200).json({ message: 'Folder and its contents successfully deleted' });
          }

          // ------------------------------------------------
          // GET – list folders & files
          // ------------------------------------------------
          if (req.method === 'GET') {
               const putanja = req.query.putanja as string | undefined;

               const data = await s3.send(
                    new ListObjectsV2Command({
                         Bucket: BUCKET,
                         Prefix: putanja ? `${putanja}/` : '',
                         Delimiter: '/',
                    })
               );

               const isEmptyFolder =
                    data.Contents?.length === 1 &&
                    data.Contents[0].Size === 0 &&
                    data.Contents[0].Key === `${putanja}/`;

               const items: Item[] = isEmptyFolder
                    ? []
                    : (data.Contents || [])
                         .map(mapS3ObjectToItem)
                         .filter((i: any) => i.type !== 'folder');

               const folders: Item[] = await Promise.all(
                    (data.CommonPrefixes || []).map(async (prefix: any) => {
                         const folderPrefix = prefix.Prefix!;
                         const folderName = folderPrefix.split('/').slice(-2, -1)[0];

                         const folderData = await s3.send(
                              new ListObjectsV2Command({
                                   Bucket: BUCKET,
                                   Prefix: folderPrefix,
                              })
                         );

                         const contents = folderData.Contents || [];
                         const folderSize = contents.reduce((acc: any, it: any) => acc + (it.Size || 0), 0);

                         return {
                              id: folderPrefix,
                              name: folderName,
                              type: 'folder' as ItemType,
                              size: folderSize,
                              itemsCount: contents.length,
                              updatedAt: contents[0]?.LastModified
                                   ? new Date(contents[0].LastModified).getTime()
                                   : null,
                         };
                    })
               );

               return res.status(200).json({ folders, items, isEmptyFolder });
          }

          return res.status(405).end();
     } catch (error) {
          console.error('S3 error:', error);
          return res.status(500).json({ error: 'Failed to handle S3 operation' });
     }
}
