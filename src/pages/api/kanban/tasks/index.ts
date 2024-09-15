// pages/api/tasks/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const kanbanService = KanbanService();

     try {
          switch (req.method) {
               case 'POST': { // Create a new task
                    const { boardId, columnId, name, userName } = req.body;
                    const newTask = await kanbanService.createTask(boardId, columnId, name, userName);
                    return res.status(201).json(newTask);
               }
               default:
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
