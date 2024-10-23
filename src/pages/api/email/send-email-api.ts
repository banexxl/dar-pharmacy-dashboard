import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Function to send an email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
     try {
          // Create a transporter object using EMAIL transport
          const transporter = nodemailer.createTransport({
               host: process.env.SMTP_HOST,
               port: 465,
               secure: true, // true for 465, false for other ports
               auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
               },
          });

          // Set up the email data (from, to, subject, etc.)
          const info = await transporter.sendMail({
               from: process.env.SMTP_USER, // Sender address
               to, // List of receivers
               subject, // Subject line
               // text, // Plain text body
               html, // HTML body (optional)
          });

          console.log('Message sent: %s', info.messageId);
          return info;
     } catch (error) {
          console.error('Error sending email:', error);
          throw new Error('Email sending failed');
     }
};

// API route handler for sending email
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
          const { to, subject, text, html } = req.body;

          // Validate the request body
          if (!to || !subject || !html) {
               return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
          }

          try {
               // Send the email
               const emailResponse = await sendEmail(to, subject, text, html);

               // Respond with a success message
               return res.status(200).json({ message: 'Email sent successfully', emailResponse });
          } catch (error) {
               // Respond with an error message
               return res.status(500).json({ error: 'Email sending failed' });
          }
     } else {
          // Respond with a 405 if the request method is not POST
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
     }
}
