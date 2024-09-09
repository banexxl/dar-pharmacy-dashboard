// pages/api/attachments/[attachmentId].ts
import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               // case 'POST': { // Create a new attachment
               //      const { taskId, attachment } = req.body; // Assume we need taskId to add the attachment
               //      const newAttachment = await KanbanService().addAttachment(taskId as string, attachment);
               //      return res.status(201).json(newAttachment);
               // }
               // case 'PUT': { // Update a specific attachment
               //      const { taskId, update } = req.body; // Assume we need taskId to find the attachment
               //      const updatedAttachment = await KanbanService().updateAttachment(taskId as string, attachmentId as string, update);
               //      return res.status(200).json(updatedAttachment);
               // }
               // case 'DELETE': { // Delete a specific attachment
               //      const { taskId } = req.body; // Assume we need taskId to find the attachment
               //      await KanbanService().deleteAttachment(taskId as string, attachmentId as string);
               //      return res.status(204).end();
               // }
               default:
                    res.setHeader('Allow', ['PUT', 'DELETE']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
