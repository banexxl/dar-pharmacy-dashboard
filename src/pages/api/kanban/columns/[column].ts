import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'PUT': { // Update a specific column
                    const { boardId, name } = req.body;
                    const updatedColumn = await KanbanService().updateColumn(boardId, req.query.column as string, name);
                    return res.status(200).json(updatedColumn);
               }
               case 'DELETE': { // Delete a specific column
                    const deleteColumnDBResponse = await KanbanService().deleteColumn(req.body);
                    if (!deleteColumnDBResponse) {
                         return res.status(404).end(`Column with id ${req.query.column as string} not found`);
                    } else {
                         return res.status(204).end();
                    }
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
