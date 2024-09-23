import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { boardId, columnId, taskId, position } = req.body;

     try {
          switch (req.method) {
               case 'PUT': { // Update a specific task
                    const updatedTask = await KanbanService().moveTask(boardId, columnId, taskId as string, position);
                    return res.status(200).json(updatedTask);
               }
               default:
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
