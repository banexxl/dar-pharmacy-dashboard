// pages/api/columns/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'POST': { // Create a new column
                    console.log('req.body', req.body);

                    const { _id, boardId, name } = req.body;

                    const newColumn = await KanbanService().createColumn(boardId, _id, name);
                    return res.status(201).json(newColumn);
               }
               case 'PUT': { // Update a specific column
                    const { boardId, columnId, update } = req.body;
                    const updatedColumn = await KanbanService().updateColumn(boardId, columnId, update);
                    return res.status(200).json(updatedColumn);
               }
               default:
                    res.setHeader('Allow', ['POST']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
