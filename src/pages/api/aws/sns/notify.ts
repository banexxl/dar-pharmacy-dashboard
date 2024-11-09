import type { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

const sns = new SNS({
     region: 'eu-central-1',
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          console.log('req.headers', req.headers);

          // Parse the body manually if it's sent as text/plain
          let body = req.body;
          if (req.headers['content-type'] === 'text/plain') {
               body = JSON.parse(req.body);
          }

          console.log('Parsed body:', body);

          const messageType = req.headers['x-amz-sns-message-type'];
          console.log('Message type:', messageType);

          if (messageType === 'SubscriptionConfirmation') {
               const token = body['Token'];
               const topicArn = body['TopicArn'];

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
               console.log('Received notification:', body.Message);
               res.status(200).json({ message: 'Notification received' });
          } else {
               res.status(400).json({ error: 'Invalid message type' });
          }
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to process SNS message' });
     }
}
