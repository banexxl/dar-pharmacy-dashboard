"use server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
     }
})

export async function getSignedURL() {

     const fileParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: 'slika',
          ContentType: 'image/*'
     };

     const s3Command = new PutObjectCommand(fileParams)

     const signedURL = await getSignedUrl(s3Client, s3Command, {
          expiresIn: 60
     })
     //await s3Client.send(s3Command)

     return { success: { url: signedURL } }
}