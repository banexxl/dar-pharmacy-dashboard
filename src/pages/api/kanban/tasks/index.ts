// pages/api/tasks/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     console.log('req.body', req.body);


     try {
          switch (req.method) {
               case 'POST': { // Create a new task
                    try {
                         const { boardId, columnId, name, createdBy } = req.body;
                         const newTask = await KanbanService().createTask(boardId, columnId, name, createdBy);
                         return res.status(201).json(newTask);
                    } catch (error: any) {
                         return res.status(400).json({ error: error.message });
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
