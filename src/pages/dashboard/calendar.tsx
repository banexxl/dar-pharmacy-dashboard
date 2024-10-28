import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NextPage } from 'next';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/resource-timeline';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { useDialog } from 'src/hooks/use-dialog';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/calendar';
import { CalendarEvent, CalendarView } from '@/schemas/calendar';
import { CalendarContainer } from '@/sections/calendar/calendar-container';
import { CalendarToolbar } from '@/sections/calendar/calendar-toolbar';
import { CalendarEventDialog } from '@/sections/calendar/calendar-event-dialog';

interface CreateDialogData {
  range?: {
    start: Date;
    end: Date;
  };
}

interface UpdateDialogData {
  eventId?: string;
}

const useEvents = (): CalendarEvent[] => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.calendar.events);

  const handleEventsGet = useCallback((): void => {
    dispatch(thunks.getEvents());
  }, [dispatch]);

  useEffect(
    () => {
      handleEventsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return events;
};

const useCurrentEvent = (
  events: CalendarEvent[],
  dialogData?: UpdateDialogData
): CalendarEvent | undefined => {
  return useMemo((): CalendarEvent | undefined => {
    if (!dialogData) {
      return undefined;
    }

    return events.find((event) => event._id === dialogData!.eventId);
  }, [dialogData, events]);
};

const Page = () => {
  const dispatch = useDispatch();
  const calendarRef = useRef<Calendar | null>(null);
  const events = useEvents();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>(mdUp ? 'timeGridDay' : 'dayGridMonth');
  const createDialog = useDialog() as ReturnType<typeof useDialog> & { data: CreateDialogData | undefined };
  const updateDialog = useDialog() as ReturnType<typeof useDialog> & { data: UpdateDialogData | undefined };

  // Type assertion to treat `data` as `CreateDialogData`
  const createDialogData = createDialog.data as CreateDialogData | undefined;

  const updatingEvent = useCurrentEvent(events, updateDialog.data);

  const handleScreenResize = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mdUp ? 'dayGridMonth' : 'timeGridDay';

      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarRef, mdUp]);

  useEffect(
    () => {
      handleScreenResize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mdUp]
  );

  const handleViewChange = useCallback((view: CalendarView): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(view);
      setView(view);
    }
  }, []);

  const handleDateToday = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDatePrev = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDateNext = useCallback((): void => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleAddClick = useCallback((): void => {
    createDialog.handleOpen({ range: { start: new Date(), end: new Date() } }); // Default data for CreateDialogData
  }, [createDialog]);

  const handleRangeSelect = useCallback(
    (arg: DateSelectArg): void => {
      const calendarEl = calendarRef.current;

      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      createDialog.handleOpen({
        range: {
          start: arg.start.getTime(),
          end: arg.end.getTime(),
        },
      });
    },
    [createDialog]
  );

  const handleEventSelect = useCallback(
    (arg: EventClickArg): void => {
      updateDialog.handleOpen({
        eventId: arg.event.id,
      });
    },
    [updateDialog]
  );

  const handleEventResize = useCallback(
    async (arg: EventResizeDoneArg): Promise<void> => {
      const { event } = arg;

      try {
        await dispatch(
          thunks.updateEvent({
            eventId: event.id,
            update: {
              allDay: event.allDay,
              start: event.start ? new Date(event.start.getTime()) : undefined,
              end: event.end ? new Date(event.end.getTime()) : undefined,
            },
          })
        );
      } catch (err) {
        console.error(err);
      }
    },
    [dispatch]
  );

  const handleEventDrop = useCallback(
    async (arg: EventDropArg): Promise<void> => {
      const { event } = arg;

      try {
        await dispatch(
          thunks.updateEvent({
            eventId: event.id,
            update: {
              allDay: event.allDay,
              start: event.start ? new Date(event.start.getTime()) : undefined,
              end: event.end ? new Date(event.end.getTime()) : undefined,
            },
          })
        );
      } catch (err) {
        console.error(err);
      }
    },
    [dispatch]
  );

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <CalendarToolbar
              date={date}
              onAddClick={handleAddClick}
              onDateNext={handleDateNext}
              onDatePrev={handleDatePrev}
              onDateToday={handleDateToday}
              onViewChange={handleViewChange}
              view={view}
            />
            <Card>
              <CalendarContainer>
                <Calendar
                  allDayMaintainDuration
                  dayMaxEventRows={3}
                  droppable
                  editable
                  eventClick={handleEventSelect}
                  eventDisplay="block"
                  eventDrop={handleEventDrop}
                  eventResizableFromStart
                  eventResize={handleEventResize}
                  events={events}
                  headerToolbar={false}
                  height={800}
                  initialDate={date}
                  initialView={view}
                  plugins={[
                    dayGridPlugin,
                    interactionPlugin,
                    listPlugin,
                    timeGridPlugin,
                    timelinePlugin,
                  ]}
                  ref={calendarRef}
                  rerenderDelay={10}
                  select={handleRangeSelect}
                  selectable
                  weekends
                />
              </CalendarContainer>
            </Card>
          </Stack>
        </Container>
      </Box>
      <CalendarEventDialog
        action="create"
        onAddComplete={createDialog.handleClose}
        onClose={createDialog.handleClose}
        open={createDialog.open}
        range={createDialogData?.range}
      />
      <CalendarEventDialog
        action="update"
        event={updatingEvent}
        onClose={updateDialog.handleClose}
        onDeleteComplete={updateDialog.handleClose}
        onEditComplete={updateDialog.handleClose}
        open={updateDialog.open}
      />
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
