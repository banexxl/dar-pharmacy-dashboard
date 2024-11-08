import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { SNS } from 'aws-sdk';

const sns = new SNS({
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

                         if (participant && participant.endpoint) {
                              // Replace 'https' with 'email' if you're using email subscriptions
                              await sns
                                   .subscribe({
                                        TopicArn: process.env.AWS_SNS_TOPIC_ARN!,
                                        Protocol: 'https', // Use 'email' if the endpoint is an email address
                                        Endpoint: participant.endpoint, // The participant's HTTP endpoint or email
                                   })
                                   .promise();

                              console.log(`Subscribed participant ${participantId} to SNS topic.`);
                         }
                    })
               );

               return res.status(201).json(newMessage);
          } else if (method === 'GET') {
               // Get participants from thread
               const participants = await ChatService().getParticipants(threadId);
               return res.status(200).json({ participants });
          } else {
               res.setHeader('Allow', ['POST', 'GET']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
