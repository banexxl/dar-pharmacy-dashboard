import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

export const sns = new SNS({
     region: 'eu-central-1',
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method } = req;
     const { senderId, threadId, recipientIds, body } = req.body;
     try {
          if (method === 'POST') {
               // Add the new message to the chat thread
               const newMessage = await ChatService().addMessage(senderId, threadId, recipientIds, body);
               // Subscribe each participant to the SNS topic
               await Promise.all(
                    recipientIds.map(async (participantId: string) => {
                         const participant = await ChatService().getParticipantById(participantId);
                         if (participant) {
                              // Replace 'https' with 'email' if you're using email subscriptions
                              const createTopicResponse = await sns
                                   .createTopic({
                                        Name: `chat-topic-${newMessage.threadId}`,
                                   })
                                   .promise().then((response) => {
                                        if (response.TopicArn) {
                                             const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
                                             const endpoint = process.env.NODE_ENV === 'development'
                                                  ? 'http://localhost:3000/api/aws/sns/notify'
                                                  : 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify';

                                             sns.subscribe({
                                                  Protocol: protocol,
                                                  TopicArn: response.TopicArn,
                                                  Endpoint: endpoint,
                                             }).promise();
                                        }
                                   })
                         }
                    })
               );

               return res.status(201).json(newMessage);
          } else if (method === 'GET') {
               // Get participants from thread
               const participants = await ChatService().getParticipants(threadId);
               return res.status(200).json({ participants });
          } else if (method === 'DELETE') {
               // Get participants from thread
               const threadDeleteResponse = await ChatService().deleteThreadById(threadId);
               // Delete SNS topic
               threadDeleteResponse ?? await Promise.all([
                    sns.deleteTopic({
                         TopicArn: `chat-topic-${threadId}`,
                    }).promise()
               ])
               return res.status(200).json({ "Thread deleted": threadDeleteResponse, "Thread ID: ": threadId });
          } else if (method === 'PUT') {
               // // Get participants from thread
               // const participants = await ChatService().updateThread(threadId, body);
               // return res.status(200).json({ participants });
          } else {
               res.setHeader('Allow', ['POST', 'GET', 'DELETE', 'PUT']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
