import { Item, ItemType } from '@/schemas/file-manager';
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

const mapS3ObjectToItem = (s3Object: aws.S3.Object): Item => {
     const isFolder = s3Object.Key?.endsWith('/');
     return {
          id: s3Object.Key!,
          name: isFolder
               ? s3Object.Key!.split('/').slice(-2, -1)[0] // Extract folder name
               : s3Object.Key!.split('/').pop()!, // Extract file name
          updatedAt: s3Object.LastModified
               ? new Date(s3Object.LastModified).getTime()
               : null,
          size: s3Object.Size ?? 0,
          type: isFolder ? 'folder' : 'file', // Assign 'folder' or 'file' correctly
          extension: !isFolder ? s3Object.Key!.split('.').pop() : undefined, // Set extension for files only
          items: undefined,
          itemsCount: undefined,
     };
};


// Helper function to extract S3 key from the URL
export const extractInfoFromUrl = (url: string) => {
     console.log('url:', url);

     let splitUrl = url.split('.com/')[1].split('?')[0];
     console.log('splitUrl:', splitUrl);

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
               console.log('fileURL:', fileURL);

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
          try {
               const { putanja } = req.query;

               const params: aws.S3.ListObjectsV2Request = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Prefix: putanja ? `${putanja}/` : '', // Set prefix based on the current folder path
                    Delimiter: '/', // Ensures that we separate folders
               };

               const data = await s3.listObjectsV2(params).promise();

               // Map files from S3
               const items: Item[] = (data.Contents || [])
                    .map(mapS3ObjectToItem)
                    .filter((item) => item.type !== 'folder'); // Exclude folders from the items array

               // Map folders from S3, filtering out the current folder itself
               const folders: Item[] = (data.CommonPrefixes || [])
                    .map((prefix) => ({
                         id: prefix.Prefix!,
                         name: prefix.Prefix!.split('/').slice(-2, -1)[0], // Extract folder name from prefix
                         type: 'folder' as ItemType,
                         size: 0,
                    }))
                    .filter((folder) => folder.name !== putanja); // Exclude the current folder itself


               // Check if no folders and no items are returned
               if (folders.length === 0 && items.length === 0) {
                    return res.redirect('/dashboard/datoteke'); // Redirect to the desired path
               }

               // Return both folders and files based on the current folder path
               return res.status(200).json({
                    folders,
                    items,
               });
          } catch (error) {
               console.error('Error retrieving items from S3:', error);
               return res.status(500).json({ error: 'Failed to retrieve items from S3' });
          }
     } else {
          res.status(405).end(); // Method Not Allowed
     }
};
