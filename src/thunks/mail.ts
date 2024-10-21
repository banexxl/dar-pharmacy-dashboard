import { Email } from '@/schemas/mail';
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
     const data = await response.json();
     // Sort emails by date in descending order before dispatching to store
     const sortedEmails = data.emails?.sort((a: Email, b: Email) => new Date(b.date).getTime() - new Date(a.date).getTime());

     dispatch(slice.actions.getEmails(sortedEmails));
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

export const thunks = {
     getEmail,
     getEmails,
     getLabels,
};
