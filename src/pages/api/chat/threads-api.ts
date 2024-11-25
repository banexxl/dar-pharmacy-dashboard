import { ChatService } from '@/services/chat-services';
import { sns } from '@/utils/aws/aws-sns';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method, body } = req;
     //Distinguish body that contains thread id or new thread

     try {
          if (method === 'POST') {
               const participants = await ChatService().getThreadByParticipantName(req.body.query as string);
               if (participants.length > 0) {
                    res.status(200).json({ participants });
               } else {
                    res.status(404).json({ message: 'Thread not found' });
               }
          } else if (method === 'DELETE') {
               const threadDeleteResponse = await ChatService().deleteThreadById(req.body.threadId as string);
               console.log('threadDeleteResponse', threadDeleteResponse);
               console.log('req.body.threadId', req.body.threadId);

               // threadDeleteResponse ? await Promise.all([
               //      sns.unsubscribe({
               //           SubscriptionArn: `arn:aws:sns:eu-central-1:056076663705:chat-topic-${req.body.threadId}-sub-1`,
               //      }),
               //      sns.deleteTopic({
               //           TopicArn: `arn:aws:sns:eu-central-1:056076663705:chat-topic-${req.body.threadId}`,
               //      }).promise(),
               // ]) :
               //      console.log('Failed to delete SNS topic');

               if (threadDeleteResponse) {
                    const unsubscribeResponse = await sns.unsubscribe({
                         SubscriptionArn: `arn:aws:sns:eu-central-1:056076663705:chat-topic-${req.body.threadId}-sub-1`,
                    })

                    const deleteTopicResponse = await sns.deleteTopic({
                         TopicArn: `arn:aws:sns:eu-central-1:056076663705:chat-topic-${req.body.threadId}`,
                    }).promise();
                    console.log('deleteTopicResponse', deleteTopicResponse);
                    console.log('unsubscribeResponse', unsubscribeResponse);


               }


               if (threadDeleteResponse) {
                    res.status(200).json({ threadDeleted: req.body.threadId });
               } else {
                    res.status(404).json({ message: 'Thread not found' });
               }
          } else {
               res.setHeader('Allow', ['POST', 'DELETE']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
