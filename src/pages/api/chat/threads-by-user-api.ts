import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method, body } = req;
     //Distinguish body that contains thread id or new thread

     try {
          if (method === 'POST') {
               const threads = await ChatService().getThreadsForUser(body.clientId);
               res.status(200).json(threads);
          } else {
               res.setHeader('Allow', ['POST']);
               res.status(405).end(`Method ${method} Not Allowed`);
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
