// pages/api/tasks/[taskId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const { boardId, taskId } = req.query;

     try {
          switch (req.method) {
               case 'GET': { // Get a specific task
                    const task = await KanbanService().getTask(taskId as string);
                    return res.status(200).json(task);
               }
               case 'PUT': { // Update a specific task
                    const { update } = req.body;
                    const updatedTask = await KanbanService().updateTask(boardId as string, taskId as string, update);
                    return res.status(200).json(updatedTask);
               }
               case 'DELETE': { // Delete a specific task
                    await KanbanService().deleteTask(boardId as string, taskId as string);
                    return res.status(204).end();
               }
               default:
                    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
