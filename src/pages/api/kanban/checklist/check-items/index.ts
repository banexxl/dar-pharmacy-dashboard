import { KanbanService } from '@/services/kanban-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'POST': {
                    const { boardId, taskId, checkItem } = req.body;
                    const addCheckItemResponse = await KanbanService().addCheckItem(boardId, taskId, checkItem);
                    if (addCheckItemResponse.acknowledged && addCheckItemResponse.modifiedCount === 1) {
                         return res.status(200).json({ message: "Check item added!", data: addCheckItemResponse })
                    } else {
                         return res.status(400).json({ error: 'Bad request' })
                    }
               }
               case 'DELETE': { // Delete a specific checklist
                    const { boardId, taskId, checkItemId } = req.body;
                    const deleted = await KanbanService().deleteCheckItem(boardId, taskId, checkItemId);
                    if (!deleted) {
                         return res.status(400).json({ error: 'Bad request' });
                    }
                    return res.status(200).json({ message: 'Checklist deleted successfully' });
               }
               case 'PUT': { // Update a specific checkist
                    const { boardId, taskId, checkItemId, update } = req.body;
                    const checkItemUpdateResponse = await KanbanService().updateCheckItem(boardId, taskId, checkItemId, update);
                    return res.status(200).json({ message: "Check item updated!", data: checkItemUpdateResponse });
               }
               default:
                    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
