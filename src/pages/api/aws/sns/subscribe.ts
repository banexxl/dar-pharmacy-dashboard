import { sns } from '@/utils/aws/aws-sns';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
          try {
               const result = await sns
                    .subscribe({
                         TopicArn: req.body.topicArn,
                         Protocol: 'https',
                         Endpoint: 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify',
                         ReturnSubscriptionArn: true,
                    })
                    .promise();
               res.status(200).json({ message: 'Subscription request sent. Awaiting confirmation.', subscriptionArn: result.SubscriptionArn });
          } catch (error) {
               console.error(error);
               res.status(500).json({ error: 'Subscription failed' });
          }
     } else {
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
     }
}
