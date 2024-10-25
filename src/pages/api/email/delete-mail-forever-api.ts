import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import { URL } from 'url';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT,
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const referer = req.headers.referer;

     if (!referer) {
          return res.status(400).json({ error: 'Referer is required' });
     }

     // Extract the label from the referer URL query
     const url = new URL(referer);
     const label = url.searchParams.get('label');

     if (!label) {
          return res.status(400).json({ error: 'Label is required in the referer URL' });
     }

     const { emailIds } = req.body;
     if (!Array.isArray(emailIds) || emailIds.length === 0) {
          return res.status(400).json({ error: 'Email IDs are required' });
     }

     const decodedEmailIds = emailIds.map((id: string) => decodeURIComponent(id));
     const imap = new Imap(imapConfig);

     const deleteEmailsInFolder = (folder: string) => {
          return new Promise((resolve, reject) => {
               imap.openBox(`INBOX.` + folder, false, (err, box) => {
                    if (err) {
                         return reject(`Failed to open folder ${`INBOX.` + folder}: ${err.message}`);
                    }

                    const deletePromises = decodedEmailIds.map((decodedEmailId) =>
                         new Promise((resolve, reject) => {
                              imap.search(['ALL', ['HEADER', 'Message-ID', decodedEmailId]], (err, results) => {
                                   if (err) {
                                        return reject(`Failed to search for email ${decodedEmailId} in folder ${folder}: ${err.message}`);
                                   }

                                   if (results.length === 0) {
                                        return resolve({ emailId: decodedEmailId, status: 'not_found_in_folder', folder });
                                   }

                                   const emailToDelete = results[0];
                                   imap.addFlags(emailToDelete, '\\Deleted', (err) => {
                                        if (err) {
                                             return reject(`Failed to mark email ${decodedEmailId} for deletion in folder ${folder}: ${err.message}`);
                                        }
                                        resolve({ emailId: decodedEmailId, status: 'marked_as_deleted', folder });
                                   });
                              });
                         })
                    );

                    Promise.all(deletePromises)
                         .then((results) => {
                              imap.expunge((err) => {
                                   if (err) {
                                        return reject(`Failed to expunge folder ${folder}: ${err.message}`);
                                   }
                                   resolve(results);
                              });
                         })
                         .catch(reject);
               });
          });
     };

     imap.once('ready', async () => {
          try {
               const results = await deleteEmailsInFolder(label);
               res.status(200).json({ message: 'Emails permanently deleted successfully', results, success: true });
          } catch (error) {
               res.status(500).json({ error });
          } finally {
               imap.end();
          }
     });

     imap.once('error', (err: any) => {
          res.status(500).json({ error: err.message });
     });

     imap.connect();
}
