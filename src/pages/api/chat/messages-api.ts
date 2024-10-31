import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     const { method, body } = req;

     try {
          if (method === 'POST') {
               const { threadId, recipientIds, body: messageBody } = body;

               // Emit the message via socket
               io.emit('sendMessage', { threadId, recipientIds, messageBody });

               // Listen for a success acknowledgment from the socket
               io.once('messageSent', async (data) => {
                    // Proceed to call the chat service only if the socket operation is successful
                    const newMessage = await ChatService().addMessage(threadId, recipientIds, messageBody);
                    res.status(201).json(newMessage);
               });

               // Optionally handle a timeout or error response if the message isn't acknowledged
               setTimeout(() => {
                    res.status(500).json({ message: 'Socket operation timed out' });
               }, 5000); // Timeout after 5 seconds

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
