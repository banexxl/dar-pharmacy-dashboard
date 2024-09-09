// pages/api/columns/[columnId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { columnId } = req.query;

     try {
          switch (req.method) {
               case 'PUT': { // Update a specific column
                    const { boardId, update } = req.body;
                    const updatedColumn = await KanbanService().updateColumn(boardId, columnId as string, update);
                    return res.status(200).json(updatedColumn);
               }
               case 'DELETE': { // Delete a specific column
                    const { boardId } = req.body;
                    await KanbanService().deleteColumn(boardId, columnId as string);
                    return res.status(204).end();
               }
               default:
                    res.setHeader('Allow', ['PUT', 'DELETE']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
