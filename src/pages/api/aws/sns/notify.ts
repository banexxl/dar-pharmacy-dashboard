import type { NextApiRequest, NextApiResponse } from 'next';
import { sns } from '../../chat/messages-api';
import { sendNotification } from '@/utils/send-aws-sns-notiffication';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

     const body = JSON.parse(req.body);
     const messageType = req.headers['x-amz-sns-message-type'];
     let topicArn = ''

     try {

          if (messageType === 'SubscriptionConfirmation') {
               const token = body['Token'];
               topicArn = body['TopicArn'];

               const result = await sns
                    .confirmSubscription({
                         Token: token,
                         TopicArn: topicArn,
                    })
                    .promise();

               console.log('Subscription confirmed:', result);
               return res.status(200).json({ message: 'Subscription confirmed', result });
          }

          if (messageType === 'Notification') {
               console.log('Received notification:', body.Message);

               const parsedMessage = JSON.parse(body.Message);
               const { senderId, recipientId, content } = parsedMessage;

               // Send a notification to the recipient
               await sendNotification(topicArn, content);

               return res.status(200).json({ message: 'Notification processed and sent' });
          }

          res.status(400).json({ error: 'Invalid message type' });
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to process SNS message' });
     }
}
