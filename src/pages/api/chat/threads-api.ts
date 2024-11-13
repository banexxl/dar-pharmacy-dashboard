import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server
import { sns } from './messages-api';

const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method, body } = req;
     //Distinguish body that contains thread id or new thread

     try {
          if (method === 'POST') {
               const thread = await ChatService().getThreadById(req.body as string);
               if (thread) {
                    res.status(200).json(thread);
               } else {
                    res.status(404).json({ message: 'Thread not found' });
               }
          } else if (method === 'DELETE') {
               const threadDeleteResponse = await ChatService().deleteThreadById(req.body.threadId as string);

               threadDeleteResponse ?? await Promise.all([
                    sns.deleteTopic({
                         TopicArn: `chat-topic-${req.body.threadId}`,
                    }).promise()
               ])

               if (threadDeleteResponse) {
                    res.status(200).json(req.body.threadId);
               } else {
                    res.status(404).json({ message: 'Thread not found' });
               }
          } else {
               res.setHeader('Allow', ['POST', 'DELETE']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
