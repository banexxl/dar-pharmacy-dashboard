import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { boardId, sourceColumnId, destinationColumnId, taskId, position } = req.body;

     try {
          switch (req.method) {
               case 'PUT': {
                    // Update a specific task's position and/or column
                    const isMoved = await KanbanService().moveTask(
                         boardId,
                         sourceColumnId,
                         destinationColumnId,
                         taskId,
                         position
                    );
                    if (isMoved) {
                         return res.status(200).json({ success: true });
                    } else {
                         return res.status(400).json({ error: 'Task movement failed' });
                    }
               }
               default:
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
