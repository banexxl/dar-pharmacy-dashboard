// pages/api/boards/[boardId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     const kanbanService = KanbanService();

     try {
          switch (req.method) {
               case 'GET': { // Get a specific board
                    const board = await kanbanService.getBoard(req.query.board as string);
                    return res.status(200).json(board);
               }
               // case 'PUT': { // Update a specific board
               //      const { update } = req.body;
               //      const updatedBoard = await kanbanService.updateBoard(boardId as string, update);
               //      return res.status(200).json(updatedBoard);
               // }
               // case 'DELETE': { // Delete a specific board
               //      await kanbanService.deleteBoard(boardId as string);
               //      return res.status(204).end();
               // }
               default:
                    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
