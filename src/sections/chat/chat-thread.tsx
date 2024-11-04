import type { FC, MutableRefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import type SimpleBarCore from 'simplebar-core';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/chat';

import { ChatMessageAdd } from './chat-message-add';
import { ChatMessages } from './chat-messages';
import { ChatThreadToolbar } from './chat-thread-toolbar';
import { Contact, CustomSession, Thread } from '@/schemas/chat';
import { useRouter } from 'next/router';
import { paths } from 'paths';
const useParticipants = (threadKey: string): Contact[] => {
  const router = useRouter();
  const [participants, setParticipants] = useState<Contact[]>([]);

  const handleParticipantsGet = useCallback(async (): Promise<void> => {
    try {
      const participants = await fetch('/api/chat/participants-api', {
        method: 'POST',
        body: JSON.stringify(threadKey),
      }).then((res) => res.json());
      setParticipants(participants);
    } catch (err) {
      console.error(err);
      router.push(paths.dashboard.chat);
    }
  }, [router, threadKey]);

  useEffect(
    () => {
      handleParticipantsGet;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threadKey]
  );

  return participants;
};

const useThread = (threadKey: string): Thread => {
  const router = useRouter();
  const dispatch = useDispatch();
  const thread = useSelector((state: any) => {
    const { threads, currentThreadId } = state.chat;

    return threads.byId[currentThreadId as string];
  });

  const handleThreadGet = useCallback(async (): Promise<void> => {
    // If thread key is not a valid key (thread id or contact id)
    // the server throws an error, this means that the user tried a shady route
    // and we redirect them on the home view

    let threadId: string;

    try {
      threadId = (await dispatch(thunks.getThread({ threadKey }))) as unknown as string;
    } catch (err) {
      console.error(err);
      router.push(paths.dashboard.chat);
      return;
    }

    // Set the active thread
    // If the thread exists, then is sets it as active, otherwise it sets is as undefined

    dispatch(
      thunks.setCurrentThread({
        threadId,
      })
    );

    // Mark the thread as seen only if it exists

    if (threadId) {
      dispatch(
        thunks.markThreadAsSeen({
          threadId,
        })
      );
    }
  }, [router, dispatch, threadKey]);

  useEffect(
    () => {
      handleThreadGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threadKey]
  );

  return thread;
};

const useMessagesScroll = (
  thread?: Thread
): {
  messagesRef: MutableRefObject<SimpleBarCore | null>;
} => {
  const messagesRef = useRef<SimpleBarCore | null>(null);

  const handleUpdate = useCallback((): void => {
    // Thread does not exist
    if (!thread) {
      return;
    }

    // Ref is not used
    if (!messagesRef.current) {
      return;
    }

    const container = messagesRef.current;
    const scrollElement = container!.getScrollElement();

    if (scrollElement) {
      scrollElement.scrollTop = container.el.scrollHeight;
    }
  }, [thread]);

  useEffect(
    () => {
      handleUpdate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thread]
  );

  return {
    messagesRef,
  };
};

interface ChatThreadProps {
  threadKey: string;
  session: CustomSession;
}

export const ChatThread: FC<ChatThreadProps> = (props) => {
  const { threadKey, session, ...other } = props;
  const dispatch = useDispatch();
  const thread = useThread(threadKey);
  const participants = useParticipants(threadKey);
  const { messagesRef } = useMessagesScroll(thread);

  const handleSend = useCallback(async (body: string): Promise<void> => {

    // If we have the thread, we use its ID to add a new message

    if (thread) {
      try {
        await dispatch(thunks.addMessage({
          recipientIds: participants.map((participant) => participant._id),
          body,
          senderId: session.data.user._id,
          threadId: thread._id!,
        }));
      } catch (err) {
        console.error(err);
      }

      return;
    }

    // Otherwise we use the recipients IDs. When using participant IDs, it means that we have to
    // get the thread.

    // Filter the current user to get only the other participants

    const recipientIds = participants
      .filter((participant) => participant._id !== session.data.user._id)
      .map((participant) => participant._id);

    // Add the new message
    let threadId: string;

    try {
      threadId = (await dispatch(thunks.addMessage({
        recipientIds,
        body,
        senderId: session.data.user._id,
        threadId: threadKey
      }))) as unknown as string;
    } catch (err) {
      console.error(err);
      return;
    }

    // Load the thread because we did not have it

    try {
      await dispatch(thunks.getThread({ threadKey: threadId }));
    } catch (err) {
      console.error(err);
      return;
    }

    // Set the new thread as active

    dispatch(thunks.setCurrentThread({ threadId }));
  },
    [dispatch, participants, thread, session.data.user]
  );

  // Maybe implement a loading state

  return (
    <Stack
      sx={{
        flexGrow: 1,
        overflow: 'hidden',
      }}
      {...other}
    >
      <ChatThreadToolbar participants={participants} session={session} />
      <Divider />
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Scrollbar
          ref={messagesRef}
          sx={{ maxHeight: '100%' }}
        >
          <ChatMessages
            messages={thread?.messages || []}
            participants={thread?.participants || []}
          />
        </Scrollbar>
      </Box>
      <Divider />
      <ChatMessageAdd onSend={handleSend} session={session} />
    </Stack>
  );
};

ChatThread.propTypes = {
  threadKey: PropTypes.string.isRequired,
  session: PropTypes.any
};
