import { CalendarEvent } from '@/schemas/calendar';
import { CalendarServices } from '@/services/calendar-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     const data: CalendarEvent = req.query.data as unknown as CalendarEvent;
     console.log('data', data);


     try {
          switch (req.method) {
               case 'GET': { // Get all calendar events
                    const events = await CalendarServices().getCalendarEvents();
                    return res.status(200).json(events);
               }
               case 'POST': { // Create a new attachment
                    const { data } = req.body; // Assume we need taskId to add the attachment
                    const newEvent = await CalendarServices().addCalendarEvent(data);
                    return res.status(201).json(newEvent);
               }
               case 'PUT': { // Update a specific calendar event
                    const { eventId, update } = req.body; // Assume we need taskId to find the event
                    const updatedEvent = await CalendarServices().updateCalendarEvent(eventId, update);
                    return res.status(200).json(updatedEvent);
               }
               case 'DELETE': { // Delete a specific calendar event
                    const { eventId } = req.body; // Assume we need taskId to find the event
                    await CalendarServices().deleteCalendarEvent(eventId);
                    return res.status(204).end();
               }
               default:
                    res.setHeader('Allow', ['PUT', 'DELETE', 'GET', 'POST']);
                    return res.status(405).end(`Method ${req.method} Not Allowed`);
          }
     } catch (error: any) {
          return res.status(500).json({ error: error.message });
     }
};

export default handler;
