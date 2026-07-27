import { Item, ItemType } from '@/schemas/file-manager';
import { _Object, S3Client } from '@aws-sdk/client-s3';
export const s3 = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
     },
});

export function extractKeyFromS3Url(url: string): string {
     try {
          const parsedUrl = new URL(url);

          const rawKey = parsedUrl.pathname.replace(
               /^\/+/,
               ''
          );

          if (!rawKey) {
               throw new Error(
                    'S3 URL does not contain an object key.'
               );
          }

          return decodeURIComponent(rawKey);
     } catch {
          throw new Error('Invalid S3 URL.');
     }
}


export function encodeS3KeyForUrl(key: string): string {
     return key
          .split('/')
          .map(encodeURIComponent)
          .join('/');
}

export const mapS3ObjectToItem = (obj: _Object): Item => {
     const key = obj.Key ?? '';
     const isFolder = key.endsWith('/');

     return {
          id: key,
          name: isFolder ? key.split('/').slice(-2, -1)[0] : key.split('/').pop()!,
          updatedAt: obj.LastModified ? new Date(obj.LastModified).getTime() : null,
          size: obj.Size ?? 0,
          type: (isFolder ? 'folder' : 'file') as ItemType,
          extension: !isFolder ? key.split('.').pop() : undefined,
          items: undefined,
          itemsCount: undefined,
     };
};