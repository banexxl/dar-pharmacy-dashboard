import aws from 'aws-sdk';

const s3 = new aws.S3({
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
     region: process.env.AWS_REGION,
});

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '5mb', // Adjust as needed
          },
     },
};

// Helper function to extract S3 key from the URL
export const extractInfoFromUrl = (url: string) => {
     let splitUrl = url.split('.com/')[1].split('?')[0];
     let key = splitUrl.replace(/%20/g, ' ');
     return key;
};

export default async (req: any, res: any) => {
     if (req.method === 'POST') {
          // Creating a folder
          try {
               const { fileName } = req.body;

               if (!fileName) {
                    return res.status(400).json({ error: 'File name not provided!' });
               }

               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: `${fileName}/`, // Folder name with a trailing slash
                    Body: '', // Empty body to represent a folder
               };

               const folderCreated = await s3.upload(params).promise();
               return res.status(200).json({ folderURL: folderCreated.Location });
          } catch (error) {
               console.error('Error creating folder:', error);
               return res.status(500).json({ error: 'Failed to create folder on AWS S3' });
          }

     } else if (req.method === 'PUT') {
          // Uploading a file
          try {
               const { file, fileName, fileType } = req.body;

               if (!file || !fileName || !fileType) {
                    return res.status(400).json({ error: 'File, fileName, or fileType not provided!' });
               }

               // Decode base64 file data if necessary
               const decodedFile = Buffer.from(file.replace(/^data:.+;base64,/, ''), 'base64');

               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: fileName, // File name including path
                    Body: decodedFile, // The actual file content
                    ContentType: fileType,
                    ACL: 'public-read', // Make uploaded file publicly accessible if needed
               };

               const uploadedFile = await s3.upload(params).promise();
               return res.status(200).json({ fileURL: uploadedFile.Location });
          } catch (error) {
               console.error('Error uploading file:', error);
               return res.status(500).json({ error: 'Failed to upload file to AWS S3' });
          }

     } else if (req.method === 'DELETE') {
          // Deleting a folder or file
          try {
               const { fileURL } = req.body;
               if (!fileURL) {
                    return res.status(400).json({ error: 'Missing file URL' });
               }

               const key = extractInfoFromUrl(fileURL);

               const params: aws.S3.DeleteObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
               };

               await s3.deleteObject(params).promise();

               return res.status(200).json({ message: 'Successfully deleted folder/file' });
          } catch (error) {
               console.error('Error deleting folder or file:', error);
               return res.status(500).json({ error: 'Failed to delete folder or file from S3' });
          }

     } else if (req.method === 'GET') {
          // Listing root files or folders if no query, otherwise list items within the given folder
          try {
               const { folderName } = req.query;

               // Define the base parameters for listing objects
               const params: aws.S3.ListObjectsV2Request = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Prefix: folderName || '', // If no folderName is provided, list root objects
                    Delimiter: '/', // Helps separate folders
               };

               const data = await s3.listObjectsV2(params).promise();
               console.log('aaaaaa', data);

               // Files in the folder or root
               const items = data.Contents?.map((item) => ({
                    key: item.Key,
                    size: item.Size,
                    lastModified: item.LastModified,
               })) || [];

               // Subfolders within the folder or root
               const folders = data.CommonPrefixes?.map((prefix) => prefix.Prefix) || [];

               return res.status(200).json({ items, folders });
          } catch (error) {
               console.error('Error fetching files/folders:', error);
               return res.status(500).json({ error: 'Failed to list files/folders from S3' });
          }
     } else {
          res.status(405).end(); // Method Not Allowed
     }
};
