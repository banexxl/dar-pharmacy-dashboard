import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT, // Default IMAP port
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { emailIds } = req.body; // Expecting an array of email IDs in the request body

     if (!Array.isArray(emailIds) || emailIds.length === 0) {
          return res.status(400).json({ error: 'Email IDs are required' });
     }

     // Decode email IDs to properly handle special characters
     const decodedEmailIds = emailIds.map((id: string) => decodeURIComponent(id));

     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                         return res.status(500).json({ error: 'Failed to open inbox.' });
                    }

                    // Search for each email ID and mark it for deletion
                    const deletePromises = decodedEmailIds.map((decodedEmailId) =>
                         new Promise((resolve, reject) => {
                              imap.search(['ALL', ['HEADER', 'Message-ID', decodedEmailId]], (err, results) => {
                                   if (err) {
                                        return reject(`Failed to search for email ${decodedEmailId}: ${err.message}`);
                                   }

                                   if (results.length === 0) {
                                        return resolve({ emailId: decodedEmailId, status: 'not_found' });
                                   }

                                   const emailToDelete = results[0]; // Get the first email ID in the search result

                                   imap.move(emailToDelete, 'INBOX.Trash', (err) => {
                                        if (err) {
                                             return reject(`Failed to mark email ${decodedEmailId} for deletion: ${err.message}`);
                                        }
                                        resolve({ emailId: decodedEmailId, status: 'marked as deleted' });
                                   });
                              });
                         })
                    );

                    Promise.all(deletePromises)
                         .then((results) => {
                              // Permanently delete marked emails
                              console.log('results', results);

                              imap.expunge((err) => {
                                   if (err) {
                                        return res.status(500).json({ error: `Failed to delete emails: ${err.message}` });
                                   }
                                   res.status(200).json({ message: 'Emails deleted successfully', success: true });
                              });
                         })
                         .catch((error) => {
                              res.status(500).json({ error: error });
                         });
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          res.status(500).json({ error: 'Failed to delete emails' });
     }
}
