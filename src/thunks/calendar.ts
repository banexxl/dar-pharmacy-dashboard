import { slice } from 'src/slices/calendar';
import type { AppThunk } from 'src/store';

const getEvents = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/calendar/calendar-api', {
          method: 'GET',
          headers: {
               'Content-Type': 'application/json',
          },
     });

     if (response.ok) {
          const data = await response.json();
          dispatch(slice.actions.getEvents(data));
     }

};

type CreateEventParams = {
     allDay: boolean;
     description: string;
     end: Date;
     start: Date;
     title: string;
};

const createEvent = (data: CreateEventParams): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/calendar/calendar-api', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
     });

     if (response.ok) {
          const data = await response.json();
          dispatch(slice.actions.createEvent(data));
     }
};

type UpdateEventParams = {
     eventId: string;
     update: {
          allDay?: boolean;
          description?: string;
          end?: Date;
          start?: Date;
          title?: string;
     };
};

const updateEvent = (params: UpdateEventParams): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/calendar/calendar-api', {
          method: 'PUT',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
     });

     if (response.ok) {
          const data = await response.json();
          dispatch(slice.actions.updateEvent(data));
     }
};

type DeleteEventParams = {
     eventId: string;
};

const deleteEvent = (params: DeleteEventParams): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/calendar/calendar-api', {
          method: 'DELETE',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
     });

     if (response.ok) {
          dispatch(slice.actions.deleteEvent(params.eventId));
     }
};

export const thunks = {
     createEvent,
     deleteEvent,
     getEvents,
     updateEvent,
};
