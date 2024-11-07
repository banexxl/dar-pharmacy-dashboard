import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { headers, body } = req;

     if (headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
          // Confirm the subscription by hitting the SubscribeURL
          await fetch(body.SubscribeURL);
          console.log('Subscription confirmed');
          return res.status(200).send('Subscription confirmed');
     } else if (headers['x-amz-sns-message-type'] === 'Notification') {
          const message = JSON.parse(body.Message);
          console.log('SNS Notification:', message);

          // Handle the notification message here
          // You could store the message in a database, send it via WebSocket to clients, etc.

          return res.status(200).send('Notification received');
     }

     res.status(400).send('Invalid SNS message');
}
