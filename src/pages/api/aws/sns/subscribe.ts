import type { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

const sns = new SNS({
     region: 'eu-central-1',
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
          try {
               const result = await sns
                    .subscribe({
                         TopicArn: `arn:aws:sns:eu-central-1:056076663705:${req.body.topicArn}`,
                         Protocol: 'https',
                         Endpoint: 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify',
                    })
                    .promise();

               console.log('Subscription response:', result);

               res.status(200).json({ message: 'Subscription request sent. Awaiting confirmation.' });
          } catch (error) {
               console.error(error);
               res.status(500).json({ error: 'Subscription failed' });
          }
     } else {
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
     }
}
