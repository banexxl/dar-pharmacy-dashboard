// pages/api/comments/index.ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'GET': { // Get all comments for a specific task
                    const { taskId } = req.query; // Get taskId from query parameters
                    if (!taskId) {
                         return res.status(400).json({ error: 'Task ID is required' });
                    }
                    const comments = await KanbanService().getCommentsByTask(taskId as string);
                    return res.status(200).json(comments);
               }
               case 'POST': { // Create a new comment
                    const { boardId, taskId, message, userLoggedIn } = req.body; // Assume we need taskId to associate the comment
                    if (!taskId || !message || !userLoggedIn || !boardId) {
                         return res.status(400).json({ error: 'TaskId and Comment and UserName and BoardId are required' });
                    }
                    await KanbanService().addComment(boardId, taskId, message, userLoggedIn);
                    return res.status(200).json('Comment added successfully');
               }
               default:
                    res.setHeader('Allow', ['GET', 'POST']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
