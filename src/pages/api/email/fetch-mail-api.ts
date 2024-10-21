import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT, // Default IMAP port
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { currentLabelId } = req.body; // Dynamically passed from the client

     if (!currentLabelId) {
          return res.status(400).json({ error: 'Mailbox name is required.' });
     }

     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               const boxName = currentLabelId === 'INBOX' ? 'INBOX' : `INBOX.${currentLabelId}`;

               imap.openBox(boxName, true, (err, box) => {
                    if (err) {
                         return res.status(500).json({ error: `Failed to open ${currentLabelId} box.` });
                    }

                    imap.search(['ALL'], (err, results) => {
                         if (err) {
                              return res.status(500).json({ error: 'Failed to search emails.' });
                         }

                         const fetchEmails = () => {
                              return new Promise((resolve, reject) => {
                                   const emails: any[] = [];

                                   const f = imap.fetch(results, { bodies: '' });

                                   const emailPromises: Promise<any>[] = [];

                                   f.on('message', (msg, seqno) => {
                                        const emailPromise = new Promise<void>((resolveEmail, rejectEmail) => {
                                             msg.on('body', (stream, info) => {
                                                  simpleParser(stream, (err, mail) => {
                                                       if (err) {
                                                            return rejectEmail(err);
                                                       }

                                                       emails.push({
                                                            id: mail.messageId,
                                                            from: mail.from?.value[0].address,
                                                            name: mail.from?.value[0].name,
                                                            date: mail.date,
                                                            subject: mail.subject,
                                                            text: mail.text,
                                                            attachments: mail.attachments,
                                                            bcc: mail.bcc,
                                                            cc: mail.cc,
                                                            inReplyTo: mail.inReplyTo,
                                                            references: mail.references,
                                                            replyTo: mail.replyTo,
                                                            to: mail.to,
                                                            textAsHtml: mail.textAsHtml,
                                                            headerLines: mail.headerLines,
                                                            headers: mail.headers,
                                                            priority: mail.priority,
                                                       });

                                                       resolveEmail(); // Email parsing completed
                                                  });
                                             });
                                        });

                                        emailPromises.push(emailPromise); // Add promise to array
                                   });

                                   f.once('end', () => {
                                        // Wait for all email parsing promises to complete
                                        Promise.all(emailPromises)
                                             .then(() => resolve(emails))
                                             .catch((err) => reject(err));
                                   });
                              });
                         };

                         fetchEmails()
                              .then((emails: any) => {
                                   // Sort the emails array by date (newest first)
                                   emails.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                   res.status(200).json({ emails });
                                   imap.end();
                              })
                              .catch((err) => {
                                   res.status(500).json({ error: err.message });
                                   imap.end();
                              });
                    });
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch emails' });
     }
}
