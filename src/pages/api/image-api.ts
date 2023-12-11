
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import moment from "moment";
import { MongoClient, ObjectId } from 'mongodb'
import { NextResponse } from "next/server";
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
          Key: fileName + "_" + moment().utc().format('YYYY.MM.DD hh:mm:ss'),
          Body: file,
          ContentType: 'image/*'
     };

     const s3Command = new PutObjectCommand(fileParams)

     await s3Client.send(s3Command)
     return file.name
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     try {
          if (!request.body) {
               return NextResponse.json({ error: 'No image selected!', status: 400 })
          }

          await uploadFileToS3(request.body.buffer, request.body.fileName)

          return NextResponse.json({ error: 'Image successfully uploaded', status: 200 })
     } catch (error) {

     }
}