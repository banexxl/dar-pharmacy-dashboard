import type { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { at } from 'lodash';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT, // Default IMAP port
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.openBox('INBOX', true, (err, box) => {
                    if (err) throw err;

                    imap.search(['ALL'], (err, results) => {
                         if (err) throw err;

                         const f = imap.fetch(results, { bodies: '' });
                         const emails: any[] = [];

                         f.on('message', (msg, seqno) => {
                              msg.on('body', (stream, info) => {
                                   simpleParser(stream, (err, mail) => {
                                        if (err) throw err;
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
                                   });
                              });
                         });

                         f.once('end', () => {
                              imap.end();

                              // Sort emails by date descending (newest first)
                              emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                              res.status(200).json({ emails });
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
