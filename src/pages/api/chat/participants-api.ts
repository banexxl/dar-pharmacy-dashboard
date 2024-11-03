import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     const { method } = req;
     const { senderId, threadId, recipientIds, body } = req.body;

     try {

          if (method === 'POST') {
               const participants = await ChatService().getParticipants(threadId);
               return res.status(200).json({ participants });
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
