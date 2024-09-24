// pages/api/tasks/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'POST': { // Create a new task
                    try {
                         const { boardId, columnId, name, createdByEmail } = req.body;
                         const newTask = await KanbanService().createTask(boardId, columnId, name, createdByEmail);
                         return res.status(201).json(newTask);
                    } catch (error: any) {
                         return res.status(400).json({ error: error.message });
                    }
               }
               case 'GET': { // Get a specific task
                    const task = await KanbanService().getTask('aaaaaa');
                    return res.status(200).json(task);
               }
               case 'PUT': { // Update a specific task
                    const updatedTask = await KanbanService().updateTask(req.body.boardId, req.body.taskId, req.body.update);
                    return res.status(200).json(updatedTask);
               }
               case 'DELETE': { // Delete a specific task
                    const { boardId, taskId } = req.body;

                    await KanbanService().deleteTask(boardId, taskId);
                    return res.status(204).end();
               }
               default:
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
