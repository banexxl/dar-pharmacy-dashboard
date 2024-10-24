import { slice } from 'src/slices/mail';
import type { AppThunk } from 'src/store';

const getLabels = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/email/fetch-mail-labels-api');
     const data = await response.json();
     dispatch(slice.actions.getLabels(data));
};

const getEmails = (currentLabelId: string): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch(`/api/email/fetch-mail-api`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentLabelId }),
     });
     console.log(response);
     if (!response.ok) {
          throw new Error('Failed to fetch emails');
     } else {
          const data = await response.json();
          console.log(data);

          // Sort emails by date in descending order before dispatching to store
          // const sortedEmails = data.emails?.sort((a: Email, b: Email) => new Date(b.date).getTime() - new Date(a.date).getTime());
          dispatch(slice.actions.getEmails(data.emails));
     }
};

type GetEmailParams = {
     emailId: string;
};

const getEmail = (params: GetEmailParams): AppThunk => async (dispatch): Promise<void> => {

     const response = await fetch(`/api/email/fetch-mail-byId-api/?emailId=${encodeURIComponent(params.emailId)}`,
          {
               method: 'GET',
               headers: {
                    'Content-Type': 'application/json',
               },
          }
     );
     const data = await response.json();
     dispatch(slice.actions.getEmail(data));

};

const deleteEmails = (params: string[]): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch(`/api/email/move-mail-to-trash-api`, {
          method: 'DELETE',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailIds: params }),
     });
     const data = await response.json();
     if (data.success) {
          dispatch(slice.actions.deleteEmails(params));
          dispatch(thunks.getLabels());
     }
}

const deleteEmailsForever = (params: string[]): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch(`/api/email/delete-mail-forever-api`, {
          method: 'DELETE',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailIds: params }),
     });
     const data = await response.json();
     console.log(data);

     if (data.success) {
          dispatch(slice.actions.deleteEmails(params));
          dispatch(thunks.getLabels());
     }
}

export const thunks = {
     getEmail,
     getEmails,
     getLabels,
     deleteEmails,
     deleteEmailsForever
};
