import { userServices } from '@/services/user-services';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          if (req.method === 'GET') {
               const contacts = await userServices().getAllUsers();
               res.status(200).json(contacts);

          } else {
               res.setHeader('Allow', ['GET', 'POST']);
               res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
     }
}

