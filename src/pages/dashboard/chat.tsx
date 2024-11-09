import { useCallback, useEffect, useRef, useState } from 'react';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { useDispatch } from 'src/store';
import { thunks } from 'src/thunks/chat';
import { useSearchParams } from 'next/navigation';
import { ChatSidebar } from '@/sections/chat/chat-sidebar';
import { ChatContainer } from '@/sections/chat/chat-container';
import { ChatThread } from '@/sections/chat/chat-thread';
import { ChatComposer } from '@/sections/chat/chat-composer';
import { ChatBlank } from '@/sections/chat/chat-blank';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useSession } from 'next-auth/react';
import { CustomSession } from '@/schemas/chat';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { ChatService } from '@/services/chat-services';
import { subscribeToSNSTopic } from '@/utils/aws-sns-subscribe';

/**
 * NOTE:
 * In our case there two possible routes
 * one that contains /chat and one with a chat?threadKey={{threadKey}}
 * if threadKey does not exist, it means that the chat is in compose mode
 */



const useSidebar = () => {
  const searchParams = useSearchParams();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [open, setOpen] = useState(mdUp);

  const handleScreenResize = useCallback((): void => {
    if (!mdUp) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [mdUp]);

  useEffect(
    () => {
      handleScreenResize();
    },
    [mdUp]
  );

  const handeParamsUpdate = useCallback((): void => {
    if (!mdUp) {
      setOpen(false);
    }
  }, [mdUp]);

  useEffect(
    () => {
      handeParamsUpdate();
    },
    [searchParams]
  );

  const handleToggle = useCallback((): void => {
    setOpen((prevState) => !prevState);
  }, []);

  const handleClose = useCallback((): void => {
    setOpen(false);
  }, []);

  return {
    handleToggle,
    handleClose,
    open,
  };
};

const Page = (props: any) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams()
  const compose = searchParams.get('compose') === 'true';
  const threadKey = searchParams.get('threadKey');
  const sidebar = useSidebar();
  const session = useSession() as unknown as CustomSession

  //Subscribe to SNS topic
  props.clientThreadIds.forEach((threadId: string) =>
    subscribeToSNSTopic(`chat-topic-${threadId}`)
  );

  //Session object
  // data: {
  //   user: {
  //     name: 'Branislav Damjanovic',
  //       email: 'damjanovic.branislav@gmail.com',
  //         image: 'https://lh3.googleusercontent.com/a/ACg8ocKfJBthT1fi0xK07pekgU4tuHkfAxZJwuuI3H7qt91Zj67XnI8=s96-c',
  //       role: 'admin',
  //         _id: '66df4fe5612e1db1f4965bae'
  //   },
  //   expires: '2024-10-31T14:08:59.025Z'
  // },
  const useThreads = (): void => {
    const dispatch = useDispatch();

    const handleThreadsGet = useCallback((): void => {
      dispatch(thunks.getThreads(session.data?.user._id! as string));
    }, [dispatch]);

    useEffect(
      () => {
        handleThreadsGet();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
  };

  useThreads();

  const view = threadKey ? 'thread' : compose ? 'compose' : 'blank';

  return (
    <>
      <Divider />
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <ChatSidebar
            container={rootRef.current}
            onClose={sidebar.handleClose}
            open={sidebar.open}
            session={session.data! as unknown as CustomSession}
          />
          <ChatContainer open={sidebar.open}>
            <Box sx={{ p: 2 }}>
              <IconButton onClick={sidebar.handleToggle}>
                <SvgIcon>
                  <Menu01Icon />
                </SvgIcon>
              </IconButton>
            </Box>
            <Divider />
            {view === 'thread' && <ChatThread threadKey={threadKey!} session={session as any} />}
            {view === 'compose' && <ChatComposer threadId={threadKey ?? ''} session={session as any} />}
            {view === 'blank' && <ChatBlank />}
          </ChatContainer>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = async (context: any) => {
  const session = await getServerSession(context.req, context.res, authOptions) as unknown as any
  const clientThreadIds = await ChatService().getThreadIdsByClientId(session?.user!._id!)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  return {
    props: {
      clientThreadIds,
    },
  };

}
