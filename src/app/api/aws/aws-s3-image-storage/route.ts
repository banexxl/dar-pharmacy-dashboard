import { NextRequest, NextResponse } from 'next/server';
import {
     DeleteObjectCommand,
     PutObjectCommand,
} from '@aws-sdk/client-s3';
import { s3 } from '@/utils/aws/aws-s3';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 4 * 1024 * 1024;

type UploadBody = {
     file: string;
     title?: string;
     extension: string;
     fileName: string;
     manufacturer_id: string;
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

     return {
          bucket,
          region,
     };
};

const buildContentType = (
     extension: string
): string | null => {
     const extensionMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          avif: 'image/avif',
          mp4: 'video/mp4',
          webm: 'video/webm',
          mov: 'video/quicktime',
          avi: 'video/x-msvideo',
     };

     return extensionMap[
          extension
               .replace(/^\./, '')
               .trim()
               .toLowerCase()
     ] ?? null;
};

const stripDataUrlPrefix = (
     dataUrl: string
): string => {
     return dataUrl.replace(
          /^data:[^;]+;base64,/,
          ''
     );
};

const encodeS3KeyForUrl = (
     key: string
): string => {
     return key
          .split('/')
          .map(encodeURIComponent)
          .join('/');
};

const sanitizePathSegment = (
     value: string
): string => {
     return value
          .trim()
          .replace(/[\\/]/g, '-')
          .replace(/\.\./g, '')
          .replace(/\s+/g, ' ');
};

const getFileBaseName = (
     fileName: string
): string => {
     const sanitizedName =
          sanitizePathSegment(fileName);

     const lastDotIndex =
          sanitizedName.lastIndexOf('.');

     if (lastDotIndex <= 0) {
          return sanitizedName;
     }

     return sanitizedName.slice(
          0,
          lastDotIndex
     );
};

export const extractKeyFromS3Url = (
     url: string
): string => {
     try {
          const parsedUrl = new URL(url);

          const key = parsedUrl.pathname.replace(
               /^\/+/,
               ''
          );

          if (!key) {
               throw new Error(
                    'S3 URL does not contain an object key.'
               );
          }

          return decodeURIComponent(key);
     } catch {
          throw new Error('Invalid S3 URL.');
     }
};

const getSupabaseAdminClient = () => {
     const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL;

     const serviceRoleKey =
          process.env.NEXT_SUPABASE_SECRET_KEY;

     if (!supabaseUrl || !serviceRoleKey) {
          throw new Error(
               'Missing Supabase server configuration.'
          );
     }

     return createClient(
          supabaseUrl,
          serviceRoleKey,
          {
               auth: {
                    autoRefreshToken: false,
                    persistSession: false,
               },
          }
     );
};

const getManufacturerName = async (
     manufacturerId: string
): Promise<string> => {
     const supabaseAdmin =
          getSupabaseAdminClient();

     const { data, error } = await supabaseAdmin
          .from('manufacturers')
          .select('name')
          .eq('id', manufacturerId)
          .maybeSingle();

     if (error) {
          console.error(
               '[getManufacturerName]',
               error
          );

          throw new Error(
               'Unable to retrieve manufacturer.'
          );
     }

     if (!data?.name) {
          throw new Error(
               'Manufacturer was not found.'
          );
     }

     return data.name;
};

// ------------------------------------------------
// POST – upload image or video
// ------------------------------------------------
export async function POST(
     request: NextRequest
) {
     try {
          const {
               bucket,
               region,
          } = getAwsConfiguration();

          const {
               file,
               extension,
               fileName,
               manufacturer_id,
          } = (await request.json()) as UploadBody;

          if (
               !file ||
               !extension ||
               !fileName ||
               !manufacturer_id
          ) {
               return NextResponse.json(
                    {
                         error:
                              'Missing file, extension, fileName, or manufacturer_id.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const manufacturerName =
               await getManufacturerName(
                    manufacturer_id
               );

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

          const base64 =
               stripDataUrlPrefix(file);

          let fileBuffer: Buffer;

          try {
               fileBuffer = Buffer.from(
                    base64,
                    'base64'
               );
          } catch {
               return NextResponse.json(
                    {
                         error: 'Invalid base64 file.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          if (fileBuffer.length === 0) {
               return NextResponse.json(
                    {
                         error: 'Uploaded file is empty.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          if (
               fileBuffer.length >
               MAX_FILE_SIZE
          ) {
               return NextResponse.json(
                    {
                         error:
                              'File is larger than the 4 MB limit.',
                    },
                    {
                         status: 413,
                    }
               );
          }

          const safeManufacturer =
               sanitizePathSegment(
                    manufacturerName
               );

          const safeFileName =
               getFileBaseName(fileName);

          if (
               !safeManufacturer ||
               !safeFileName
          ) {
               return NextResponse.json(
                    {
                         error:
                              'Invalid manufacturer or file name.',
                    },
                    {
                         status: 400,
                    }
               );
          }

          const key = [
               'slike artikla',
               safeManufacturer,
               `${safeFileName}.${normalizedExtension}`,
          ].join('/');

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

          return NextResponse.json({
               imageUrl,
               key,
               manufacturer: {
                    id: manufacturer_id,
                    name: manufacturerName,
               },
          });
     } catch (error) {
          console.error(
               '[S3 image upload]',
               error
          );

          const message =
               error instanceof Error
                    ? error.message
                    : 'Failed to upload file to S3.';

          const status =
               message ===
                    'Manufacturer was not found.'
                    ? 404
                    : 500;

          return NextResponse.json(
               {
                    error: message,
               },
               {
                    status,
               }
          );
     }
}

// ------------------------------------------------
// DELETE – delete image or video
// ------------------------------------------------
export async function DELETE(
     request: NextRequest
) {
     try {
          const { bucket } =
               getAwsConfiguration();

          const body =
               (await request.json()) as DeleteBody;

          const key =
               body.key?.trim() ||
               (
                    body.url
                         ? extractKeyFromS3Url(body.url)
                         : null
               );

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

          return NextResponse.json({
               message:
                    'Image deleted successfully.',
               key,
          });
     } catch (error) {
          console.error(
               '[S3 image deletion]',
               error
          );

          return NextResponse.json(
               {
                    error:
                         error instanceof Error
                              ? error.message
                              : 'Failed to delete image from S3.',
               },
               {
                    status: 500,
               }
          );
     }
}