import type { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

const sns = new SNS({
     region: 'eu-central-1',
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     console.log('Received SNS message NOTIFICATION:', req.body);

     if (req.method === 'POST') {
          try {
               const messageType = req.headers['x-amz-sns-message-type'];

               if (messageType === 'SubscriptionConfirmation') {
                    const token = req.body.Token;
                    console.log('Token:', token);

                    const topicArn = req.body.TopicArn;
                    console.log('TopicArn:', topicArn);

                    console.log('Confirming subscription with token:', token);

                    const result = await sns
                         .confirmSubscription({
                              Token: token,
                              TopicArn: topicArn,
                         })
                         .promise();

                    console.log('Subscription confirmed:', result);
                    res.status(200).json({ message: 'Subscription confirmed', result });
               } else if (messageType === 'Notification') {
                    console.log('Received notification:', req.body.Message);
                    res.status(200).json({ message: 'Notification received' });
               } else {
                    res.status(400).json({ error: 'Invalid message type' });
               }
          } catch (error) {
               console.error(error);
               res.status(500).json({ error: 'Failed to process SNS message' });
          }
     } else {
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
     }
}
