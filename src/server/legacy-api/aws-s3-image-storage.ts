import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

import { encodeS3KeyForUrl, extractKeyFromS3Url, s3 } from '@/utils/aws/aws-s3';

export const runtime = 'nodejs';

type UploadBody = {
     file: string;
     title?: string;
     extension: string;
     fileName: string;
     manufacturer: string;
};

type DeleteBody = {
     url?: string;
     key?: string;
};

function buildContentType(extension: string): string | null {
     const ext = extension
          .replace(/^\./, '')
          .trim()
          .toLowerCase();

     const contentTypes: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          webp: 'image/webp',
          avif: 'image/avif',
          mp4: 'video/mp4',
          webm: 'video/webm',
          mov: 'video/quicktime',
          avi: 'video/x-msvideo',
     };

     return contentTypes[ext] ?? null;
}

function stripDataUrlPrefix(dataUrl: string): string {
     return dataUrl.replace(
          /^data:[^;]+;base64,/,
          ''
     );
}

function getAwsConfiguration() {
     const bucket = process.env.AWS_S3_BUCKET_NAME;
     const region = process.env.AWS_REGION;

     if (!bucket || !region) {
          throw new Error(
               'Missing AWS_S3_BUCKET_NAME or AWS_REGION.'
          );
     }

     return {
          bucket,
          region,
     };
}

export async function POST(request: NextRequest) {
     try {
          const {
               bucket,
               region,
          } = getAwsConfiguration();

          const {
               file,
               extension,
               fileName,
               manufacturer,
          } = (await request.json()) as UploadBody;

          if (
               !file ||
               !extension ||
               !fileName ||
               !manufacturer
          ) {
               return NextResponse.json(
                    {
                         error:
                              'Missing file, extension, fileName, or manufacturer.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const normalizedExtension = extension
               .replace(/^\./, '')
               .trim()
               .toLowerCase();

          const contentType = buildContentType(
               normalizedExtension
          );

          if (!contentType) {
               return NextResponse.json(
                    {
                         error: 'Unsupported file type.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const base64 = stripDataUrlPrefix(file);
          const body = Buffer.from(base64, 'base64');

          if (body.length === 0) {
               return NextResponse.json(
                    {
                         error: 'The uploaded file is empty.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const baseFileName = fileName
               .replace(/\.[^.]+$/, '')
               .trim();

          if (!baseFileName) {
               return NextResponse.json(
                    {
                         error: 'Invalid file name.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const key =
               `slike artikla/` +
               `${manufacturer}/` +
               `${baseFileName}.${normalizedExtension}`;

          await s3.send(
               new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: body,
                    ContentType: contentType,

                    // Remove this if the bucket has ACLs disabled.
                    ACL: 'public-read',
               })
          );

          const imageUrl =
               `https://${bucket}` +
               `.s3.${region}.amazonaws.com/` +
               encodeS3KeyForUrl(key);

          return NextResponse.json(
               {
                    imageUrl,
                    key,
               },
               {
                    status: 200,
               }
          );
     } catch (error) {
          console.error(
               'Error uploading file to S3:',
               error
          );

          const message =
               error instanceof Error
                    ? error.message
                    : 'Failed to upload file to S3.';

          return NextResponse.json(
               {
                    error: message,
               },
               {
                    status: 500,
               }
          );
     }
}

export async function DELETE(request: NextRequest) {
     try {
          const { bucket } = getAwsConfiguration();

          const {
               url,
               key: suppliedKey,
          } = (await request.json()) as DeleteBody;

          const key =
               suppliedKey?.trim() ||
               (url
                    ? extractKeyFromS3Url(url)
                    : null);

          if (!key) {
               return NextResponse.json(
                    {
                         error: 'Missing key or URL.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          await s3.send(
               new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
               })
          );

          return NextResponse.json(
               {
                    message:
                         'Image deleted successfully.',
                    key,
               },
               {
                    status: 200,
               }
          );
     } catch (error) {
          console.error(
               'Error deleting image from S3:',
               error
          );

          const message =
               error instanceof Error
                    ? error.message
                    : 'Failed to delete image from S3.';

          return NextResponse.json(
               {
                    error: message,
               },
               {
                    status: 500,
               }
          );
     }
}