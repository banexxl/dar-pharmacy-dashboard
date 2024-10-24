import { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';
import nodemailer from 'nodemailer';

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT, // Default IMAP port
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { to, subject, text, html } = req.body; // Extract email details from the request body

     if (!to || !subject || !text) {
          return res.status(400).json({ error: 'To, subject, and text fields are required' });
     }

     try {
          // Step 1: Send the email using Nodemailer
          const transporter = nodemailer.createTransport({
               host: process.env.SMTP_HOST,
               port: parseInt(process.env.SMTP_PORT || '587', 10),
               secure: false, // true for 465, false for other ports
               auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
               },
          });

          const mailOptions = {
               from: process.env.SMTP_USER, // Sender address
               to, // Recipient address
               subject, // Subject line
               text, // Plain text body
               html, // HTML body (optional)
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('Message sent:', info.messageId);

          // Step 2: Append the sent email to the "Sent" folder
          const imap = new Imap(imapConfig);

          imap.once('ready', async () => {
               imap.openBox('INBOX.Sent', false, (err, box) => {
                    if (err) {
                         return res.status(500).json({ error: 'Failed to open Sent folder' });
                    }

                    // Append the sent email to the "Sent" folder
                    imap.append(html, { mailbox: 'INBOX.Sent' }, (err) => {
                         if (err) {
                              return res.status(500).json({ error: 'Failed to append email to Sent folder' });
                         }

                         res.status(200).json({ message: 'Email sent and saved to Sent folder successfully' });
                         imap.end();
                    });
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          console.error('Error sending or appending email:', error);
          res.status(500).json({ error: 'Failed to send or append email to Sent folder' });
     }
}
