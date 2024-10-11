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

export default async (req: any, res: any) => {
     if (req.method === 'POST') {
          const { fileName, type, folderPath, fileContent } = req.body;
          try {
               // Check for required fields based on the type
               if (type === 'folder') {
                    if (!fileName || !folderPath) {
                         return res.status(400).json({ error: 'Folder name or path not provided!' });
                    }

                    // Ensure folderPath ends with a slash
                    const cleanFolderPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

                    // Create folder at the specified path
                    const params = {
                         Bucket: process.env.AWS_S3_BUCKET_NAME!,
                         Key: `${cleanFolderPath}`, // Ensure folder is created at the right path
                         Body: '', // Empty body for a folder
                    };

                    const folderCreated = await s3.upload(params).promise();
                    return res.status(200).json({ folderURL: folderCreated.Location });

               } else if (type === 'file') {
                    if (!fileName || !fileContent || !type) {
                         return res.status(400).json({ error: 'File, file name, or file type not provided!' });
                    }

                    //Convert file content to binary format
                    const content = Buffer.from(fileContent)

                    const params: aws.S3.PutObjectRequest = {
                         Bucket: process.env.AWS_S3_BUCKET_NAME!,
                         Key: `${folderPath}${fileName}`, // File name including path
                         Body: content, // The actual file content
                         ContentType: type,
                         ACL: 'public-read', // Make uploaded file publicly accessible if needed
                    };

                    const uploadedFileResponse = await s3.upload(params).promise();
                    console.log('uploadedFileResponse:', uploadedFileResponse);
                    return res.status(200).json({ message: 'OK' });
               } else {
                    // Handle unsupported type
                    return res.status(400).json({ error: 'Invalid type provided!' });
               }
          } catch (error) {
               console.error('Error handling S3 upload:', error);
               return res.status(500).json({ error: 'Failed to handle upload on AWS S3' });
          }
     }
     else if (req.method === 'PUT') {
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

     }
     else if (req.method === 'DELETE') {
          try {
               const { fileURL } = req.body;
               console.log('fileURL:', fileURL);

               if (!fileURL) {
                    return res.status(400).json({ error: 'Missing file URL' });
               }

               // First, list all objects under the folder
               const listParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Prefix: fileURL, // The folder path
               };

               const listedObjects = await s3.listObjectsV2(listParams).promise();

               if (listedObjects.Contents?.length === 0) {
                    // If no objects are inside, delete the folder
                    const deleteParams = {
                         Bucket: process.env.AWS_S3_BUCKET_NAME!,
                         Key: fileURL,
                    };

                    await s3.deleteObject(deleteParams).promise();
                    return res.status(200).json({ message: 'Folder successfully deleted' });
               }

               // If there are objects, delete them all
               const deleteParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Delete: {
                         Objects: listedObjects.Contents!
                              .filter((item) => item.Key !== undefined)
                              .map((item) => ({ Key: item.Key! })),
                    },
               };

               await s3.deleteObjects(deleteParams).promise();

               // After deleting all objects, delete the folder itself
               await s3.deleteObject({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: fileURL,
               }).promise();

               return res.status(200).json({ message: 'Folder and its contents successfully deleted' });

          } catch (error) {
               console.error('Error deleting folder or file:', error);
               return res.status(500).json({ error: 'Failed to delete folder or file from S3' });
          }
     }
     else if (req.method === 'GET') {
          try {
               const { putanja } = req.query;

               const params: aws.S3.ListObjectsV2Request = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Prefix: putanja ? `${putanja}/` : '', // Set prefix based on the current folder path
                    Delimiter: '/', // Ensures that we separate folders
               };

               const data = await s3.listObjectsV2(params).promise();

               // Check if the folder contains only itself
               const isEmptyFolder =
                    data.Contents?.length === 1 &&
                    data.Contents[0].Size === 0 &&
                    data.Contents[0].Key === `${putanja}/`;

               const items: Item[] = isEmptyFolder
                    ? []
                    : data.Contents!.map(mapS3ObjectToItem).filter((item) => item.type !== 'folder'); // Exclude folders from the items array

               // Process folders and calculate their size, item count, and creation date
               const folders: Item[] = await Promise.all(
                    (data.CommonPrefixes || []).map(async (prefix) => {
                         const folderPrefix = prefix.Prefix!;
                         const folderName = folderPrefix.split('/').slice(-2, -1)[0]; // Extract folder name from prefix

                         // Fetch all items (files and subfolders) inside the folder
                         const folderParams: aws.S3.ListObjectsV2Request = {
                              Bucket: process.env.AWS_S3_BUCKET_NAME!,
                              Prefix: folderPrefix, // Get all items inside the folder
                         };
                         const folderData = await s3.listObjectsV2(folderParams).promise();

                         // Sum the sizes of items in the folder
                         const folderSize = folderData.Contents!.reduce((acc, item) => acc + (item.Size || 0), 0);

                         // Count total number of items (files + folders)
                         const itemCount = folderData.Contents!.length + (folderData.CommonPrefixes?.length || 0);

                         // Get the folder creation date (use the 'LastModified' of the first item in the folder)
                         const folderCreationDate = folderData.Contents?.[0]?.LastModified || null;

                         return {
                              id: folderPrefix,
                              name: folderName,
                              type: 'folder' as ItemType,
                              size: folderSize,          // Return the calculated size of the folder
                              itemsCount: itemCount,     // Return total number of items (files + folders)
                              updatedAt: folderCreationDate ? new Date(folderCreationDate).getTime() : null, // Creation date based on the first file
                         };
                    })
               );

               return res.status(200).json({
                    folders,
                    items,
                    isEmptyFolder,
               });
          } catch (error) {
               console.error('Error retrieving items from S3:', error);
               return res.status(500).json({ error: 'Failed to retrieve items from S3' });
          }
     }
     else {
          res.status(405).end(); // Method Not Allowed
     }
};
