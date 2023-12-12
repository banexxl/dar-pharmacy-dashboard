import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import moment from "moment"

const s3Client = new S3Client({
     region: process.env.AWS_REGION!,
     credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
     },
})
console.log(process.env.AWS_REGION!, process.env.AWS_S3_SECRET_KEY!, process.env.AWS_S3_ACCESS_KEY!);

const allowedFileTypes = [
     "image/jpeg",
     "image/png",
     "video/mp4",
     "video/quicktime"
]

const maxFileSize = 1048576 * 10 // 1 MB

type SignedURLResponse = Promise<
     | { failure?: undefined; success: { url: string } }
     | { failure: string; success?: undefined }
>

type GetSignedURLParams = {
     fileType: string
     fileSize: number
     checksum: string
}
export const getSignedURL = async ({
     fileType,
     fileSize,
     checksum,
}: GetSignedURLParams) => {

     if (!allowedFileTypes.includes(fileType)) {
          return { failure: "File type not allowed" }
     }

     if (fileSize > maxFileSize) {
          return { failure: "File size too large" }
     }

     const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: "Artikl" + moment().format("YYYY.MM.DD hh:mm:ss"),
          ContentType: fileType,
          ContentLength: fileSize,
          ChecksumSHA256: checksum,
     })

     const url = await getSignedUrl(
          s3Client,
          putObjectCommand,
          { expiresIn: 60 } // 60 seconds
     )

     console.log({ success: url })

     return { success: { url } }
}