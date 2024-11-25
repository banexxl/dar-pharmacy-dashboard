import { s3 } from '@/utils/aws/aws-s3';
import aws from 'aws-sdk';
import moment from 'moment';

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '4mb' // Set desired value here
          }
     }
}

export const extractInfoFromUrl = (url: string) => {

     let splitUrl = url.split('.com/')[1].split('?')[0]

     let key = splitUrl.replace(/%20/g, " ")

     return key;
}

export default async (req: any, res: any) => {

     if (req.method === 'POST') {
          try {
               const { file, title, extension, fileName, manufacturer } = req.body;

               if (!file || !title || !extension) {
                    return res.status(400).json({ error: 'Missing file, title, or extension' });
               }

               // Determine the content type based on the file extension
               let contentType: string;
               const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
               const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];

               if (imageExtensions.includes(extension.toLowerCase())) {
                    contentType = `image/${extension}`;
               } else if (videoExtensions.includes(extension.toLowerCase())) {
                    contentType = `video/${extension}`;
               } else {
                    return res.status(400).json({ error: 'Unsupported file type' });
               }

               // Decode base64 data, removing the correct prefix
               const base64Prefix = contentType.startsWith('image')
                    ? /^data:image\/\w+;base64,/
                    : /^data:video\/\w+;base64,/;

               const decodedFile = Buffer.from(file.replace(base64Prefix, ''), 'base64');

               // Adjust key to desired structure
               const key = `slike artikla/${manufacturer}/${fileName.split('.')[0]}.${extension}`;

               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
                    Body: decodedFile,
                    ACL: 'public-read',
                    ContentType: contentType, // Use dynamic content type
               };

               const uploadedFile = await s3.upload(params).promise();
               return res.status(200).json({ imageUrl: uploadedFile.Location });
          } catch (error) {
               console.error('Error uploading file:', error);
               return res.status(500).json({ error: 'Failed to upload file to S3' });
          }
     }
     else if (req.method === 'DELETE') {

          let awsUrl = extractInfoFromUrl(req.body);
          try {

               if (!awsUrl) {
                    return res.status(400).json({ error: 'Missing key' });
               }

               const params: aws.S3.DeleteObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: awsUrl
               };

               await s3.deleteObject(params, function (err, data) {
                    if (err) console.log(err, err.stack);
                    else console.log(data);
               }).promise();

               return res.status(200).json({ message: 'Image deleted successfully' });
          } catch (error) {
               console.error('Error deleting image:', error);
               return res.status(500).json({ error: 'Failed to delete image from S3' });
          }
     }
     else {
          res.status(405).end(); // Method Not Allowed
     }
};
