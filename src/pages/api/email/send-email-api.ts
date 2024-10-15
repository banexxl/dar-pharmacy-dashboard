// sendEmail.ts

import nodemailer from 'nodemailer';

// Function to send an email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
     try {
          // Create a transporter object using EMAIL transport
          const transporter = nodemailer.createTransport({
               host: process.env.EMAIL_HOST,
               port: parseInt(process.env.EMAIL_PORT || '587', 10),
               secure: false, // true for 465, false for other ports
               auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
               },
          });

          // Set up the email data (from, to, subject, etc.)
          const info = await transporter.sendMail({
               from: process.env.EMAIL_USER, // Sender address
               to, // List of receivers
               subject, // Subject line
               text, // Plain text body
               html, // HTML body (optional)
          });

          console.log('Message sent: %s', info.messageId);
     } catch (error) {
          console.error('Error sending email:', error);
          throw new Error('Email sending failed');
     }
};
