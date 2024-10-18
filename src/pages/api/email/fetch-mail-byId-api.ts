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
     const { emailId } = req.query; // Expecting the email ID to be passed as a query parameter
     if (!emailId) {
          return res.status(400).json({ error: 'Email ID is required' });
     }

     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.openBox('INBOX', true, (err, box) => {
                    if (err) throw err;

                    imap.search(['ALL'], (err, results) => {
                         if (err) throw err;

                         const f = imap.fetch(results, { bodies: '' });
                         let foundEmail: any = null;

                         f.on('message', (msg, seqno) => {
                              msg.on('body', (stream, info) => {
                                   simpleParser(stream, (err, mail) => {
                                        if (err) throw err;
                                        // Check if the current email's messageId matches the requested id
                                        if (mail.messageId === emailId) {
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
                                        }
                                   });
                              });
                         });
                         f.once('end', () => {
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
