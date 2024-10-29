import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'; // Import Socket.io server

const chatService = ChatService();
const io = new Server(); // Create a new socket server instance

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { method, query, body } = req;
     const { action } = query;

     try {
          switch (action) {
               case 'contacts':
                    if (method === 'GET') {
                         const contacts = await chatService.getContacts(query.q as string);
                         res.status(200).json(contacts);
                    } else {
                         res.setHeader('Allow', ['GET']);
                         res.status(405).end(`Method ${method} Not Allowed`);
                    }
                    break;

               case 'threads':
                    if (method === 'GET') {
                         const threads = await chatService.getThreads();
                         res.status(200).json(threads);
                    } else {
                         res.setHeader('Allow', ['GET']);
                         res.status(405).end(`Method ${method} Not Allowed`);
                    }
                    break;

               case 'thread':
                    if (method === 'GET') {
                         const thread = await chatService.getThreadById(query.id as string);
                         if (thread) {
                              res.status(200).json(thread);
                         } else {
                              res.status(404).json({ message: 'Thread not found' });
                         }
                    } else if (method === 'PATCH') {
                         await chatService.markThreadAsSeen(query.id as string);
                         res.status(204).end();
                    } else {
                         res.setHeader('Allow', ['GET', 'PATCH']);
                         res.status(405).end(`Method ${method} Not Allowed`);
                    }
                    break;

               case 'message':
                    if (method === 'POST') {
                         const { threadId, recipientIds, body: messageBody } = body;

                         // Emit the message via socket
                         io.emit('sendMessage', { threadId, recipientIds, messageBody });

                         // Listen for a success acknowledgment from the socket
                         io.once('messageSent', async (data) => {
                              // Proceed to call the chat service only if the socket operation is successful
                              const newMessage = await chatService.addMessage(threadId, recipientIds, messageBody);
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
                    break;

               default:
                    res.status(404).json({ message: 'Action not found' });
          }
     } catch (error: any) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
     }
};

export default handler;
