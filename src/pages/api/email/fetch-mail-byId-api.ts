import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { PassThrough } from 'stream';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT, // Default IMAP port
     tls: true,
     authTimeout: 5000,
};

// Function to parse mail as a promise
const parseMail = (stream: PassThrough) => {
     return new Promise((resolve, reject) => {
          simpleParser(stream, (err, mail) => {
               if (err) return reject(err);
               resolve(mail);
          });
     });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { emailId } = req.query; // Expecting the email ID to be passed as a query parameter

     // Decode the emailId to properly handle special characters like '+'
     const decodedEmailId = decodeURIComponent(emailId as string);

     if (!decodedEmailId) {
          return res.status(400).json({ error: 'Email ID is required' });
     }

     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                         return res.status(500).json({ error: `Failed to open inbox.` });
                    }

                    // Search for all emails
                    imap.search(['ALL'], async (err, results) => {
                         if (err) {
                              return res.status(500).json({ error: 'Failed to search emails.' });
                         }

                         const f = imap.fetch(results, { bodies: '', markSeen: true }); // Set markSeen to true to mark emails as read
                         let foundEmail: any = null;

                         const messagePromises: Promise<any>[] = [];

                         f.on('message', (msg, seqno) => {
                              const messageStream = new PassThrough();
                              msg.on('body', (stream, info) => {
                                   // Create a stream for each message and push it to the promises array
                                   stream.pipe(messageStream);
                                   const parsedMessagePromise = parseMail(messageStream).then((mail: any) => {
                                        // Check if the current email's messageId matches the requested id
                                        if (mail.messageId === decodedEmailId) {
                                             foundEmail = {
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
                                             };

                                             // Mark this email as read (\\Seen)
                                             imap.addFlags(seqno, '\\Seen', (err) => {
                                                  if (err) {
                                                       console.error(`Failed to mark email ${mail.messageId} as read: `, err);
                                                  }
                                             });
                                        }
                                   });
                                   messagePromises.push(parsedMessagePromise);
                              });
                         });

                         f.once('end', async () => {
                              // Wait for all messages to be processed
                              await Promise.all(messagePromises);
                              imap.end();
                              if (foundEmail) {
                                   res.status(200).json(foundEmail);
                              } else {
                                   res.status(404).json({ error: 'Email not found' });
                              }
                         });
                    });
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch email' });
     }
}
