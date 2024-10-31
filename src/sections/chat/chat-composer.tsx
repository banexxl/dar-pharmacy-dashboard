import type { FC } from 'react';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useDispatch } from 'src/store';

import { ChatComposerRecipients } from './chat-composer-recipients';
import { ChatMessageAdd } from './chat-message-add';
import { Contact } from '@/schemas/chat';
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

export const ChatComposer: FC = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { handleRecipientAdd, handleRecipientRemove, recipients } = useRecipients();

  const handleSend = useCallback(
    async (body: string): Promise<void> => {
      const recipientIds = recipients.map((recipient) => recipient._id);

      let threadId: string;

      try {
        // Handle send message and redirect to the new thread
        threadId = (await dispatch(thunks.addMessage({
          recipientIds,
          body,
        })
        )) as unknown as string;
      } catch (err) {
        console.error(err);
        return;
      }

      router.push(paths.dashboard.chat + `?threadKey=${threadId}`);
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
      />
    </Box>
  );
};
