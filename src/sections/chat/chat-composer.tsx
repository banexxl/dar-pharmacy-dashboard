import type { FC } from 'react';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useDispatch } from 'src/store';

import { ChatComposerRecipients } from './chat-composer-recipients';
import { ChatMessageAdd } from './chat-message-add';
import { Contact, CustomSession } from '@/schemas/chat';
import { useRouter } from 'next/router';
import { paths } from 'paths';
import { thunks } from '@/thunks/chat';

const useRecipients = () => {
  const [recipients, setRecipients] = useState<Contact[]>([]);

  const handleRecipientAdd = useCallback((recipient: Contact): void => {
    setRecipients((prevState) => {
      const found = prevState.find((_recipient) => _recipient._id === recipient._id);

      if (found) {
        return prevState;
      }

      return [...prevState, recipient];
    });
  }, []);

  const handleRecipientRemove = useCallback((recipientId: string): void => {
    setRecipients((prevState) => {
      return prevState.filter((recipient) => recipient._id !== recipientId);
    });
  }, []);

  return {
    handleRecipientAdd,
    handleRecipientRemove,
    recipients,
  };
};

type ChatComposerProps = {
  //Override session.user with contact
  session: CustomSession,
  threadId: string
};

export const ChatComposer = (props: ChatComposerProps) => {
  const { session, threadId } = props;
  const dispatch = useDispatch();
  const router = useRouter();
  const { handleRecipientAdd, handleRecipientRemove, recipients } = useRecipients();

  const handleSend = useCallback(async (body: string, senderId: string): Promise<void> => {

    const recipientIds = recipients.map((recipient) => recipient._id);

    let newThreadId: string;

    try {
      // This line now returns a Promise<string>, so `newThreadId` will be a string
      newThreadId = await dispatch(thunks.addMessage({ senderId, threadId, recipientIds, body })) as unknown as string

    } catch (err) {
      console.error(err);
      return;
    } finally {
      dispatch(thunks.getThreads(session.data?.user._id! as string));
    }

    router.push(paths.dashboard.chat + `?threadKey=${newThreadId}`);
  },
    [dispatch, router, recipients]
  );

  const canAddMessage = recipients.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
      {...props}
    >
      <ChatComposerRecipients
        onRecipientAdd={handleRecipientAdd}
        onRecipientRemove={handleRecipientRemove}
        recipients={recipients}
      />
      <Divider />
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <ChatMessageAdd
        disabled={!canAddMessage}
        onSend={handleSend}
        session={session}
      />
    </Box>
  );
};
