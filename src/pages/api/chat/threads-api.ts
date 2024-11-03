import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method, body } = req;
     //Distinguish body that contains thread id or new thread

     try {
          if (method === 'GET') {
               const threads = await ChatService().getThreads();
               res.status(200).json(threads);
          } else if (method === 'POST') {
               const thread = await ChatService().getThreadById(req.body as string);
               if (thread) {
                    res.status(200).json(thread);
               } else {
                    res.status(404).json({ message: 'Thread not found' });
               }
          } else {
               res.setHeader('Allow', ['GET', 'POST']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
