import { slice } from 'src/slices/mail';
import type { AppThunk } from 'src/store';

const getLabels = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/email/fetch-mail-labels-api');
     const data = await response.json();
     dispatch(slice.actions.getLabels(data));
};

const getEmails = (): AppThunk => async (dispatch): Promise<void> => {
     const response = await fetch('/api/email/fetch-mail-api');
     const data = await response.json();
     dispatch(slice.actions.getEmails(data.emails));
};

type GetEmailParams = {
     emailId: string;
};

// const getEmail = (params: GetEmailParams): AppThunk => async (dispatch): Promise<void> => {

//      const response = await fetchEmailById(params.emailId);

//      dispatch(slice.actions.getEmail(response));
// };


export const thunks = {
     // getEmail,
     getEmails,
     getLabels,
};
