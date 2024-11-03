import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT,
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const emailId = req.query.emailId as string;

     if (!emailId) {
          return res.status(400).json({ error: 'Email ID is required' });
     }

     const decodedEmailId = decodeURIComponent(emailId);
     const imap = new Imap(imapConfig);

     const deleteEmailFromFolder = (folder: string) => {
          return new Promise((resolve, reject) => {
               imap.openBox(folder, false, (err, box) => {
                    if (err) {
                         return reject(`Failed to open folder ${folder}: ${err.message}`);
                    }

                    imap.search(['ALL', ['HEADER', 'Message-ID', decodedEmailId]], (err, results) => {
                         if (err) {
                              return reject(`Failed to search for email ${decodedEmailId} in folder ${folder}: ${err.message}`);
                         }

                         if (results.length === 0) {
                              return resolve({ emailId: decodedEmailId, status: 'not_found_in_folder', folder });
                         }
                         const f = imap.fetch(results, { bodies: '', markSeen: true });
                    });
               });
          });
     };

     imap.once('ready', async () => {
          try {
               const folders = ['INBOX', 'INBOX.Sent'];
               const results = [];

               for (const folder of folders) {
                    const result = await deleteEmailFromFolder(folder);
                    results.push(result);
               }

               res.status(200).json({
                    message: 'Email processed for deletion successfully',
                    results,
                    success: true,
               });
          } catch (error) {
               res.status(500).json({ error });
          } finally {
               imap.expunge(() => imap.end());
          }
     });

     imap.once('error', (err: any) => {
          res.status(500).json({ error: err.message });
     });

     imap.connect();
}
