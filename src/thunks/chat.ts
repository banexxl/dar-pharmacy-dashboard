import { slice } from '@/slices/chat';
import type { AppThunk } from 'src/store';

const getContacts = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/chat/contacts-api', {
          method: 'GET',
          headers: {
               'Content-Type': 'application/json',
          },
     }).then((response) => response.json());
     dispatch(slice.actions.getContacts(response));
};

const getThreads = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/chat/threads-api', {
          method: 'GET',
          headers: {
               'Content-Type': 'application/json',
          },
     }).then((response) => response.json());
     dispatch(slice.actions.getThreads(response));
};

type GetThreadParams = {
     threadKey: string;
};

const getThread = (params: GetThreadParams): AppThunk => async (dispatch): Promise<string | undefined> => {
     console.log(params)
     const response = await fetch(`/api/chat/threads-api/`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(params.threadKey),
     }).then((response) => response.json());
     dispatch(slice.actions.getThread(response));
     return response?.id;
};

type MarkThreadAsSeenParams = {
     threadId: string;
};

const markThreadAsSeen = (params: MarkThreadAsSeenParams): AppThunk => async (dispatch): Promise<void> => {
     await fetch(`/api/chat/threads-api/${params.threadId}/seen`);
     dispatch(slice.actions.markThreadAsSeen(params.threadId));
};

type SetCurrentThreadParams = {
     threadId?: string;
};

const setCurrentThread = (params: SetCurrentThreadParams): AppThunk => (dispatch): void => {
     dispatch(slice.actions.setCurrentThread(params.threadId));
};

type AddMessageParams = {
     threadId?: string;
     recipientIds?: string[];
     body: string;
};

const addMessage = (params: AddMessageParams): AppThunk => async (dispatch): Promise<string> => {
     const response = await fetch('/api/chat/messages-api',
          {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify(params)
          }).then((response) => response.json());
     dispatch(slice.actions.addMessage(response));

     return response.threadId;
};

export const thunks = {
     addMessage,
     getContacts,
     getThread,
     getThreads,
     markThreadAsSeen,
     setCurrentThread,
};
