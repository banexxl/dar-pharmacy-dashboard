import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import nodemailer from 'nodemailer';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT,
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { to, subject, text, html } = req.body;

     if (!to || !subject || !text) {
          return res.status(400).json({ error: 'To, subject, and text fields are required' });
     }

     try {
          // Step 1: Send the email using Nodemailer
          const transporter = nodemailer.createTransport({
               host: process.env.SMTP_HOST,
               port: 465,
               secure: true,
               auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
               },
          });

          const mailOptions = {
               from: process.env.SMTP_USER,
               to,
               subject,
               text,
               html,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('Message sent:', info.messageId);

          // Step 2: Append the sent email to the "Sent" folder
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.openBox('INBOX.Sent', false, (err, box) => {
                    if (err) {
                         console.error('Failed to open Sent folder:', err);
                         return res.status(500).json({ error: 'Failed to open Sent folder' });
                    }

                    // Construct the full raw email with headers and body
                    const date = new Date().toUTCString();
                    const boundary = 'next-boundary';
                    const rawMessage = Buffer.from(
                         `From: ${process.env.SMTP_USER}
To: ${to}
Subject: ${subject}
Date: ${date}
Message-ID: ${info.messageId}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=utf-8

${text}

--${boundary}
Content-Type: text/html; charset=utf-8

${html}

--${boundary}--
`
                    );

                    // Append the sent email to the "Sent" folder
                    imap.append(rawMessage, { mailbox: 'INBOX.Sent' }, (appendErr) => {
                         if (appendErr) {
                              console.error('Failed to append email to Sent folder:', appendErr);
                              return res.status(500).json({ error: 'Failed to append email to Sent folder' });
                         }

                         res.status(200).json({ message: 'Email poslat uspešno!', messageId: info.messageId });
                         imap.end();
                    });
               });
          });

          imap.once('error', (err: any) => {
               console.error('IMAP error:', err);
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          console.error('Error sending or appending email:', error);
          res.status(500).json({ error: 'Failed to send or append email to Sent folder' });
     }
}