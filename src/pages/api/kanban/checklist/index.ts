// pages/api/comments/[commentId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'PUT': { // Update a specific checkist
                    const { taskId, update } = req.body;
                    const checkListUpdateResponse = await KanbanService().updateOrCreateChecklist(taskId, update);
                    if (checkListUpdateResponse.updated) {
                         return res.status(201).json({ message: 'Checklist updated successfully' });
                    } else if (!checkListUpdateResponse.updated) {
                         return res.status(200).json({ message: 'Checklist created successfully' });
                    }
               }
               case 'DELETE': { // Delete a specific checklist
                    const { taskId } = req.body;
                    const deleted = await KanbanService().deleteChecklist(taskId);
                    if (!deleted) {
                         return res.status(400).json({ error: 'Bad request' });
                    }
                    return res.status(200).json({ message: 'Checklist deleted successfully' });
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
