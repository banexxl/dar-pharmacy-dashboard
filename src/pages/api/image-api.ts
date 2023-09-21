import multer from 'multer';
import fs from 'fs';
import path from 'path';

const publicFolderPath = path.join(process.cwd(), 'public/products/');
const upload = multer({
          dest: publicFolderPath,
          fileFilter: (req, file, cb) => {
                    if (file.mimetype.startsWith('image/')) {
                              cb(null, true);
                    } else {
                              cb(new Error('Only images are allowed.'));
                    }
          },
});

const uploadMiddleware = upload.single('file');

export const config = {
          api: {
                    bodyParser: false,
          },
};

export default async function handler(req, res) {
          try {
                    uploadMiddleware(req, res, async function (err) {
                              if (err) {
                                        console.error('Error uploading file:', err);
                                        return res.status(500).json({ error: 'Error uploading file.' });
                              }

                              const { file, body: { name } } = req;

                              // Generate a unique filename using the current timestamp
                              const timestamp = new Date().getTime();
                              const fileName = `${timestamp}-${file.originalname}`;

                              // Create a path to save the file in the public folder
                              const filePath = path.join(publicFolderPath, fileName);

                              // Read the file and write it to the desired location
                              fs.readFile(file.path, (readErr, data) => {
                                        if (readErr) {
                                                  console.error('Error reading file:', readErr);
                                                  return res.status(500).json({ error: 'Error reading file.' });
                                        }

                                        // Write the file buffer to the file
                                        fs.writeFile(filePath, data, (writeErr) => {
                                                  if (writeErr) {
                                                            console.error('Error writing file:', writeErr);
                                                            return res.status(500).json({ error: 'Error saving file.' });
                                                  }

                                                  res.status(200).json({ message: 'File uploaded successfully.', fileName });
                                        });
                              });
                    });
          } catch (error) {
                    console.error('Error:', error);
                    res.status(500).json({ error: 'Server error.' });
          }
}
