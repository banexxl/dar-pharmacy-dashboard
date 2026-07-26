import { NextRequest, NextResponse } from 'next/server';
import {
     DeleteObjectCommand,
     DeleteObjectsCommand,
     ListObjectsV2Command,
     PutObjectCommand,
     type _Object,
} from '@aws-sdk/client-s3';
import type { Item, ItemType } from '@/schemas/file-manager';
import { s3 } from '@/utils/aws/aws-s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

const getBucket = (): string => {
     if (!BUCKET) {
          throw new Error('AWS_S3_BUCKET_NAME is not configured.');
     }

     return BUCKET;
};

const mapS3ObjectToItem = (object: _Object): Item => {
     const key = object.Key ?? '';
     const isFolder = key.endsWith('/');

     return {
          id: key,
          name: isFolder
               ? key.split('/').slice(-2, -1)[0]
               : key.split('/').pop() ?? key,
          updatedAt: object.LastModified
               ? object.LastModified.getTime()
               : null,
          size: object.Size ?? 0,
          type: isFolder
               ? ('folder' as ItemType)
               : ('file' as ItemType),
          extension: !isFolder
               ? key.split('.').pop()?.toLowerCase()
               : undefined,
          items: undefined,
          itemsCount: undefined,
     };
};

const errorResponse = (
     error: unknown,
     fallbackMessage: string
) => {
     console.error('[S3 route]', error);

     return NextResponse.json(
          {
               error:
                    error instanceof Error
                         ? error.message
                         : fallbackMessage,
          },
          {
               status: 500,
          }
     );
};

// ------------------------------------------------
// POST – create folder or upload file
// ------------------------------------------------
export async function POST(request: NextRequest) {
     try {
          const bucket = getBucket();

          const {
               fileName,
               type,
               folderPath,
               fileContent,
          } = await request.json();

          if (type === 'folder') {
               if (!fileName || !folderPath) {
                    return NextResponse.json(
                         {
                              error:
                                   'Folder name or path not provided!',
                         },
                         {
                              status: 400,
                         }
                    );
               }

               const key = folderPath.endsWith('/')
                    ? folderPath
                    : `${folderPath}/`;

               await s3.send(
                    new PutObjectCommand({
                         Bucket: bucket,
                         Key: key,
                         Body: '',
                    })
               );

               return NextResponse.json({
                    folderURL: `s3://${bucket}/${key}`,
               });
          }

          if (type === 'file') {
               if (
                    !fileName ||
                    !fileContent ||
                    !folderPath
               ) {
                    return NextResponse.json(
                         {
                              error:
                                   'File, file name, or path not provided!',
                         },
                         {
                              status: 400,
                         }
                    );
               }

               const extension = String(fileName)
                    .split('.')
                    .pop()
                    ?.toLowerCase();

               const contentType =
                    extension === 'pdf'
                         ? 'application/pdf'
                         : 'application/octet-stream';

               const encodedContent = String(fileContent);

               const base64Content =
                    encodedContent.includes('base64,')
                         ? encodedContent.split('base64,').pop() ?? ''
                         : encodedContent;

               const body = Buffer.from(
                    base64Content,
                    'base64'
               );

               await s3.send(
                    new PutObjectCommand({
                         Bucket: bucket,
                         Key: folderPath,
                         Body: body,
                         ContentType: contentType,
                    })
               );

               return NextResponse.json({
                    message: 'OK',
               });
          }

          return NextResponse.json(
               {
                    error: 'Invalid type provided!',
               },
               {
                    status: 400,
               }
          );
     } catch (error) {
          return errorResponse(
               error,
               'Failed to create folder or upload file.'
          );
     }
}

// ------------------------------------------------
// PUT – upload file
// ------------------------------------------------
export async function PUT(request: NextRequest) {
     try {
          const bucket = getBucket();

          const {
               file,
               fileName,
               fileType,
          } = await request.json();

          if (!file || !fileName || !fileType) {
               return NextResponse.json(
                    {
                         error:
                              'File, fileName, or fileType not provided!',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const decodedFile = Buffer.from(
               String(file).replace(
                    /^data:.+;base64,/,
                    ''
               ),
               'base64'
          );

          await s3.send(
               new PutObjectCommand({
                    Bucket: bucket,
                    Key: fileName,
                    Body: decodedFile,
                    ContentType: fileType,
               })
          );

          return NextResponse.json({
               fileURL:
                    `https://${bucket}.s3.amazonaws.com/` +
                    encodeURIComponent(fileName).replace(/%2F/g, '/'),
          });
     } catch (error) {
          return errorResponse(
               error,
               'Failed to upload file.'
          );
     }
}

// ------------------------------------------------
// DELETE – delete file or folder and its contents
// ------------------------------------------------
export async function DELETE(request: NextRequest) {
     try {
          const bucket = getBucket();
          const { fileURL } = await request.json();

          if (!fileURL) {
               return NextResponse.json(
                    {
                         error: 'Missing file URL',
                    },
                    {
                         status: 400,
                    }
               );
          }

          let continuationToken: string | undefined;

          do {
               const listed = await s3.send(
                    new ListObjectsV2Command({
                         Bucket: bucket,
                         Prefix: fileURL,
                         ContinuationToken: continuationToken,
                    })
               );

               const objects =
                    listed.Contents
                         ?.filter((object) => object.Key)
                         .map((object) => ({
                              Key: object.Key!,
                         })) ?? [];

               if (objects.length > 0) {
                    await s3.send(
                         new DeleteObjectsCommand({
                              Bucket: bucket,
                              Delete: {
                                   Objects: objects,
                                   Quiet: true,
                              },
                         })
                    );
               }

               continuationToken =
                    listed.IsTruncated
                         ? listed.NextContinuationToken
                         : undefined;
          } while (continuationToken);

          /*
           * Also attempt to remove the exact key. This handles a single
           * file and explicit zero-byte folder objects.
           */
          await s3.send(
               new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: fileURL,
               })
          );

          return NextResponse.json({
               message:
                    'File or folder and its contents successfully deleted.',
          });
     } catch (error) {
          return errorResponse(
               error,
               'Failed to delete S3 object.'
          );
     }
}

// ------------------------------------------------
// GET – list folders and files
// ------------------------------------------------
export async function GET(request: NextRequest) {
     try {
          const bucket = getBucket();

          const putanja =
               request.nextUrl.searchParams.get('putanja');

          const prefix = putanja
               ? `${putanja.replace(/\/+$/, '')}/`
               : '';

          const data = await s3.send(
               new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: prefix,
                    Delimiter: '/',
               })
          );

          const isEmptyFolder =
               data.Contents?.length === 1 &&
               data.Contents[0].Size === 0 &&
               data.Contents[0].Key === prefix;

          const items: Item[] = isEmptyFolder
               ? []
               : (data.Contents ?? [])
                    .map(mapS3ObjectToItem)
                    .filter((item) => item.type !== 'folder');

          const folders: Item[] = await Promise.all(
               (data.CommonPrefixes ?? []).map(
                    async (commonPrefix) => {
                         const folderPrefix =
                              commonPrefix.Prefix ?? '';

                         const folderName =
                              folderPrefix
                                   .split('/')
                                   .slice(-2, -1)[0] ??
                              folderPrefix;

                         const folderData = await s3.send(
                              new ListObjectsV2Command({
                                   Bucket: bucket,
                                   Prefix: folderPrefix,
                              })
                         );

                         const contents =
                              folderData.Contents ?? [];

                         const folderSize = contents.reduce(
                              (total, item) =>
                                   total + (item.Size ?? 0),
                              0
                         );

                         return {
                              id: folderPrefix,
                              name: folderName,
                              type: 'folder' as ItemType,
                              size: folderSize,
                              itemsCount: contents.filter(
                                   (item) =>
                                        item.Key !== folderPrefix
                              ).length,
                              updatedAt:
                                   contents[0]?.LastModified
                                        ? contents[0].LastModified.getTime()
                                        : null,
                         };
                    }
               )
          );

          return NextResponse.json({
               folders,
               items,
               isEmptyFolder,
          });
     } catch (error) {
          return errorResponse(
               error,
               'Failed to list S3 objects.'
          );
     }
}