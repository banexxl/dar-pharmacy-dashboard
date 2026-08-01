import { NextRequest, NextResponse } from 'next/server';
import {
     DeleteObjectCommand,
     PutObjectCommand,
} from '@aws-sdk/client-s3';
import { extractKeyFromS3Url, s3 } from '@/utils/aws/aws-s3';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 4 * 1024 * 1024;

type UploadBody = {
     file: string;
     extension: string;
     fileName: string;
};

type DeleteBody = {
     url?: string;
     key?: string;
};

const getAwsConfiguration = () => {
     const bucket = process.env.AWS_S3_BUCKET_NAME;
     const region = process.env.AWS_REGION;

     if (!bucket || !region) {
          throw new Error(
               'Missing AWS_S3_BUCKET_NAME or AWS_REGION.'
          );
     }

     return { bucket, region };
};

const buildContentType = (extension: string): string | null => {
     const extensionMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          avif: 'image/avif',
     };

     return extensionMap[extension.replace(/^\./, '').trim().toLowerCase()] ?? null;
};

const stripDataUrlPrefix = (dataUrl: string): string => {
     return dataUrl.replace(/^data:[^;]+;base64,/, '');
};

const encodeS3KeyForUrl = (key: string): string => {
     return key.split('/').map(encodeURIComponent).join('/');
};

const sanitizePathSegment = (value: string): string => {
     return value
          .trim()
          .replace(/[\\/]/g, '-')
          .replace(/\.\./g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9\-_.]/g, '');
};

// ------------------------------------------------
// POST – upload blog banner image
// ------------------------------------------------
export async function POST(request: NextRequest) {
     try {
          const { bucket, region } = getAwsConfiguration();

          const { file, extension, fileName } =
               (await request.json()) as UploadBody;

          if (!file || !extension || !fileName) {
               return NextResponse.json(
                    { error: 'Missing file, extension, or fileName.' },
                    { status: 400 }
               );
          }

          const normalizedExtension = extension
               .replace(/^\./, '')
               .trim()
               .toLowerCase();

          const contentType = buildContentType(normalizedExtension);

          if (!contentType) {
               return NextResponse.json(
                    { error: 'Unsupported file type. Only images allowed.' },
                    { status: 400 }
               );
          }

          const base64 = stripDataUrlPrefix(file);

          let fileBuffer: Buffer;

          try {
               fileBuffer = Buffer.from(base64, 'base64');
          } catch {
               return NextResponse.json(
                    { error: 'Invalid base64 file.' },
                    { status: 400 }
               );
          }

          if (fileBuffer.length === 0) {
               return NextResponse.json(
                    { error: 'Uploaded file is empty.' },
                    { status: 400 }
               );
          }

          if (fileBuffer.length > MAX_FILE_SIZE) {
               return NextResponse.json(
                    { error: 'File is larger than the 4 MB limit.' },
                    { status: 413 }
               );
          }

          const safeFileName = sanitizePathSegment(
               fileName.replace(/\.[^.]+$/, '')
          );

          const timestamp = Date.now();
          const key = `banners/blog/${safeFileName}-${timestamp}.${normalizedExtension}`;

          await s3.send(
               new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
               })
          );

          const imageUrl =
               `https://${bucket}.s3.${region}.amazonaws.com/` +
               encodeS3KeyForUrl(key);

          return NextResponse.json({ imageUrl, key });
     } catch (error) {
          console.error('[Blog image upload]', error);

          const message =
               error instanceof Error
                    ? error.message
                    : 'Failed to upload file to S3.';

          return NextResponse.json({ error: message }, { status: 500 });
     }
}

// ------------------------------------------------
// DELETE – delete blog banner image
// ------------------------------------------------
export async function DELETE(request: NextRequest) {
     try {
          const { bucket } = getAwsConfiguration();

          const body = (await request.json()) as DeleteBody;

          const key =
               body.key?.trim() ||
               (body.url ? extractKeyFromS3Url(body.url) : null);

          if (!key) {
               return NextResponse.json(
                    { error: 'Missing key or URL.' },
                    { status: 400 }
               );
          }

          await s3.send(
               new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
               })
          );

          return NextResponse.json({
               message: 'Image deleted successfully.',
               key,
          });
     } catch (error) {
          console.error('[Blog image deletion]', error);

          return NextResponse.json(
               {
                    error:
                         error instanceof Error
                              ? error.message
                              : 'Failed to delete image from S3.',
               },
               { status: 500 }
          );
     }
}
