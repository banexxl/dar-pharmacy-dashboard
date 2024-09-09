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
                    const { boardId, taskId, comment, userId } = req.body; // Assume we need taskId to associate the comment
                    if (!taskId || !comment) {
                         return res.status(400).json({ error: 'Task ID and comment are required' });
                    }
                    const newComment = await KanbanService().addComment(boardId, taskId, comment, userId);
                    return res.status(201).json(newComment);
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
