
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { NextApiRequest, NextApiResponse } from 'next/types'

const s3Client = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
     }
})

const uploadFileToS3 = async (file: any, fileName: string) => {

     const fileParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: file,
          ContentType: 'image/*'
     };

     const s3Command = new PutObjectCommand(fileParams)

     await s3Client.send(s3Command).then(s3res => console.log(s3res))
     return file.name
}

export default async function handler(
     request: NextApiRequest,
     response: NextApiResponse
) {
     console.log(request.body.fileName);

     try {
          if (request.method === 'PUT') {
               const contentType = request.headers['content-type'];

               if (!contentType || !contentType.includes('multipart/form-data')) {
                    return response
                         .status(400)
                         .json({ error: 'Request content-type must be multipart/form-data' });
               }

               const data: Uint8Array[] = [];

               request.on('data', (chunk) => {
                    data.push(chunk);
               });

               request.on('end', async () => {
                    const fileData = Buffer.concat(data);

                    // Accessing other necessary properties like file name from request headers
                    const fileName = request.headers['file-name'] as string;

                    if (!fileData || !fileName) {
                         return response
                              .status(400)
                              .json({ error: 'No image data or file name provided' });
                    }

                    // Call the uploadFileToS3 function with fileData and fileName
                    const uploadedFileName = await uploadFileToS3(fileData, fileName);

                    return response
                         .status(200)
                         .json({ message: 'Image successfully uploaded to S3', uploadedFileName });
               });
          } else {
               return response.status(405).json({ error: 'Method Not Allowed' });
          }
     } catch (error) {
          console.error('Error handling file upload:', error);
          return response.status(500).json({ error: 'Failed to upload image' });
     }
}