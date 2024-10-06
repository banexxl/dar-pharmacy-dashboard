import aws from 'aws-sdk';
import moment from 'moment';

const s3 = new aws.S3({
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
     region: process.env.AWS_REGION,
});

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '2mb' // Set desired value here
          }
     }
}

export const extractInfoFromUrl = (url: string) => {

     let splitUrl = url.split('.com/')[1].split('?')[0]

     let key = splitUrl.replace(/%20/g, " ")

     return key;

}

export default async (req: any, res: any) => {

     const day = moment().format('DD')
     const month = (moment().month() + 1).toString().padStart(2, '0');
     const year = moment().year().toString();

     if (req.method === 'POST') {

          try {
               const { file, extension, fileName } = req.body;

               if (!file || !extension) {
                    return res.status(400).json({ error: 'Missing file, or extension' });
               }

               // Decode base64 data
               const decodedFile = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');

               // Adjust key to desired structure
               const key = `kanban/${year}/${month}/${day}/${fileName.split('.')[0]}.${extension}`;

               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
                    Body: decodedFile, // Use decoded file
                    ACL: 'public-read', // Make uploaded file publicly accessible
                    ContentType: 'file'
               };

               const uploadedImage = await s3.upload(params).promise();
               return res.status(200).json({ imageUrl: uploadedImage.Location });
          } catch (error) {
               console.error('Error uploading image:', error);
               return res.status(500).json({ error: 'Failed to upload image to S3' });
          }
     } else if (req.method === 'DELETE') {

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
