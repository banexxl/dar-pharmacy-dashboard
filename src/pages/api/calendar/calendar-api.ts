import { CalendarEvent } from '@/schemas/calendar';
import { CalendarServices } from '@/services/calendar-services';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

     try {
          switch (req.method) {
               case 'GET': { // Get all calendar events
                    const events = await CalendarServices().getCalendarEvents();

                    if (!events) {
                         return res.status(500).json({ error: 'Failed to fetch events' });
                    } else {
                         return res.status(200).json(events);
                    }
               }
               case 'POST': { // Create a new attachment
                    const { data } = req.body; // Assume we need taskId to add the attachment
                    const newEvent = await CalendarServices().addCalendarEvent(data);

                    if (!newEvent) {
                         return res.status(500).json({ error: 'Failed to create event' });
                    } else {
                         return res.status(201).json(newEvent);
                    }
               }
               case 'PUT': { // Update a specific calendar event
                    const { eventId, update } = req.body; // Assume we need taskId to find the event
                    const updatedEvent: any = await CalendarServices().updateCalendarEvent(eventId, update);

                    if (!updatedEvent) {
                         return res.status(404).json({ error: 'Event not found' });
                    } else if (updatedEvent.acknowledged && updatedEvent.modifiedCount === 1) {
                         return res.status(200).json(updatedEvent);
                    } else {
                         return res.status(500).json({ error: 'Failed to update event' });
                    }
               }
               case 'DELETE': { // Delete a specific calendar event
                    const { eventId } = req.body; // Assume we need taskId to find the event
                    const deletedEvent: any = await CalendarServices().deleteCalendarEvent(eventId);
                    console.log('deletedEvent', deletedEvent.acknowledged, deletedEvent.deletedCount);

                    if (!deletedEvent) {
                         return res.status(404).json({ error: 'Event not found' });
                    } else if (deletedEvent.acknowledged && deletedEvent.deletedCount === 1) {
                         return res.status(200).json({ success: 'Event deleted successfully' });
                    } else {
                         return res.status(500).json({ error: 'Failed to delete event' });
                    }
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
