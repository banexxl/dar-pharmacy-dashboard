// pages/api/boards/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const kanbanService = KanbanService();

     try {
          switch (req.method) {
               case 'POST': { // Create a new board
                    const { title } = req.body;
                    const newBoard = await kanbanService.addBoard(title);
                    return res.status(201).json(newBoard);
               }
               // case 'GET': { // Get all boards
               //      const boards = await kanbanService.getAllBoards();
               //      return res.status(200).json(boards);
               // }
               default:
                    res.setHeader('Allow', ['POST', 'GET']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
