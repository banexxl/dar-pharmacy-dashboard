import { ChatService } from '@/services/chat-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     const { method, body } = req;

     try {

          if (method === 'GET') {
               const contacts = await ChatService().getAllContacts();
               if (!contacts || contacts.length === 0) {
                    return res.status(404).json({ error: 'No contacts found' });
               }
               res.status(200).json(contacts);
          } if (method === 'POST') {
               const contact = await ChatService().getContact(body.query as string);
               if (!contact) {
                    return res.status(404).json({ error: 'Contact not found' });
               }
               res.status(200).json(contact);
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
