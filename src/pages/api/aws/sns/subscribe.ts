import type { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

const sns = new SNS({
     region: 'eu-central-1', // e.g., 'us-east-1'
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
          try {
               // Subscribe to the SNS topic
               const result = await sns
                    .subscribe({
                         TopicArn: process.env.AWS_SNS_TOPIC_ARN!,
                         Protocol: 'https', // 'https' for HTTPS endpoint
                         Endpoint: 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify', // Endpoint of the Next.js app
                    })
                    .promise();

               res.status(200).json({ message: 'Subscription successful', result });
          } catch (error) {
               console.error(error);
               res.status(500).json({ error: 'Subscription failed' });
          }
     } else {
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
     }
}
