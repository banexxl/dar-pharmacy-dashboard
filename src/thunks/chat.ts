import { sendNotification } from '@/pages/api/aws/sns/send-notification';
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

const getThreads = (clientId: string): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/chat/threads-by-user-api', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clientId }),
     }).then((response) => response.json());
     dispatch(slice.actions.getThreads(response));
};

type GetThreadParams = {
     threadKey: string;
};

const getThread = (params: GetThreadParams): AppThunk => async (dispatch): Promise<string | undefined> => {
     const response = await fetch(`/api/chat/threads-api/`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify(params.threadKey),
     }).then((response) => response.json());

     if (response.status === 200) {
          dispatch(slice.actions.getThread(response));
          return response?.id;
     }

     return undefined;
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
     senderId: string;
     threadId: string;
     recipientIds: string[];
     body: string;
};

const addMessage = (params: AddMessageParams): AppThunk => async (dispatch): Promise<string> => {

     try {
          const response = await fetch('/api/chat/messages-api', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
               },
               body: JSON.stringify(params),
          });

          const data = await response.json();
          if (response.ok) {
               dispatch(slice.actions.addMessage(data));
               sendNotification(params.senderId, params.body);
               return data.threadId;
          } else {
               throw new Error('Failed to add message');
          }
     } catch (error) {
          console.error('Error in addMessage thunk:', error);
          throw error; // Ensure the error is propagated to the caller
     }
};


export const thunks = {
     addMessage,
     getContacts,
     getThread,
     getThreads,
     markThreadAsSeen,
     setCurrentThread,
};