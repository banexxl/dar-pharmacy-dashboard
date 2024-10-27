import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // enables click and drag functionality
import { EventClickArg, EventInput, } from '@fullcalendar/core';

const CalendarComponent: React.FC = () => {
     const [events, setEvents] = useState<EventInput[]>([
          { title: 'Meeting', date: '2024-10-01' },
          { title: 'Conference', date: '2024-10-07' },
     ]);

     const handleDateClick = (arg: { dateStr: string }) => {
          // Add a new event when a date is clicked
          const newEvent = { title: 'New Event', date: arg.dateStr };
          setEvents([...events, newEvent]);
     };

     const handleEventClick = (clickInfo: EventClickArg) => {
          alert(`Event clicked: ${clickInfo.event.title}`);
     };

     return (
          <FullCalendar
               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
               initialView="dayGridMonth" // shows a month view by default
               editable={true}
               selectable={true}
               events={events} // List of events to display
               dateClick={handleDateClick} // Callback when a date cell is clicked
               eventClick={handleEventClick} // Callback when an event is clicked
               headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
               }}
               height="auto" // Adjusts calendar height automatically
          />
     );
};

export default CalendarComponent;
