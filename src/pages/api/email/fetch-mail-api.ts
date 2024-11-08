import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT,
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { currentLabelId } = req.body;

     if (!currentLabelId) {
          return res.status(400).json({ error: 'Mailbox name is required.' });
     }

     let responseSent = false;

     const sendResponse = (statusCode: number, data: any) => {
          if (!responseSent) {
               res.status(statusCode).json(data);
               responseSent = true;
          }
     };

     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               const boxName = currentLabelId === 'INBOX' ? 'INBOX' : `INBOX.${currentLabelId}`;

               imap.openBox(boxName, true, (err, box) => {
                    if (err) {
                         imap.end();
                         return sendResponse(500, { error: `Failed to open ${currentLabelId} box.` });
                    }

                    imap.search(['ALL'], (err, results) => {
                         if (err) {
                              imap.end();
                              return sendResponse(500, { error: 'Failed to search emails.' });
                         }

                         if (!results || results.length === 0) {
                              imap.end();
                              return sendResponse(202, { message: 'No emails found.' });
                         }

                         const fetchEmails = () => {
                              return new Promise((resolve, reject) => {
                                   const emails: any[] = [];
                                   const emailPromises: Promise<void>[] = [];
                                   const f = imap.fetch(results, { bodies: '' });

                                   f.on('message', (msg, seqno) => {
                                        const emailPromise = new Promise<void>((resolveEmail, rejectEmail) => {
                                             msg.on('body', (stream, info) => {
                                                  simpleParser(stream, (err, mail) => {
                                                       if (err) {
                                                            rejectEmail(err);
                                                            return;
                                                       }

                                                       emails.push({
                                                            id: mail.messageId,
                                                            from: mail.from?.value[0].address,
                                                            name: mail.from?.value[0].name,
                                                            date: mail.date,
                                                            subject: mail.subject,
                                                            text: mail.text,
                                                            attachments: mail.attachments,
                                                       });

                                                       resolveEmail();
                                                  });
                                             });
                                        });

                                        emailPromises.push(emailPromise);
                                   });

                                   f.once('error', (err) => {
                                        reject(err);
                                   });

                                   f.once('end', () => {
                                        Promise.all(emailPromises)
                                             .then(() => resolve(emails))
                                             .catch((err) => reject(err));
                                   });
                              });
                         };

                         fetchEmails()
                              .then((emails: any) => {
                                   emails.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                   sendResponse(200, { emails });
                                   imap.end();
                              })
                              .catch((err) => {
                                   sendResponse(500, { error: err.message });
                                   imap.end();
                              });
                    });
               });
          });

          imap.once('error', (err: any) => {
               sendResponse(500, { error: err.message });
               imap.end();
          });

          imap.connect();
     } catch (error) {
          sendResponse(500, { error: 'Failed to fetch emails' });
     }
}
