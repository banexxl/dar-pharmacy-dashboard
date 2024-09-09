// pages/api/comments/[commentId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'POST': { // Create a new comment
                    const { boardId, columnId, taskId, message } = req.body; // Assume we need taskId to add the comment
                    const newComment = await KanbanService().addComment(boardId as string, columnId as string, taskId as string, message);
                    return res.status(201).json(newComment);
               }
               case 'PUT': { // Update a specific comment
                    const { boardId, taskId, commentId, message } = req.body; // Assume we need taskId to find the comment
                    const updatedComment = await KanbanService().updateComment(boardId as string, taskId as string, commentId as string, message);
                    return res.status(200).json(updatedComment);
               }
               case 'DELETE': { // Delete a specific comment
                    const { boardId, taskId, commentId } = req.body; // Assume we need taskId to find the comment
                    await KanbanService().deleteComment(boardId as string, taskId as string, commentId);
                    return res.status(204).end();
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
