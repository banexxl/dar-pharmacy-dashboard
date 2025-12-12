import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { Label } from '@/schemas/mail';
import { thunks } from '@/thunks/mail';
import { MailSidebar } from '@/sections/mail/mail-sidebar';
import { MailContainer } from '@/sections/mail/mail-container';
import { MailThread } from '@/sections/mail/mail-thread';
import { MailList } from '@/sections/mail/mail-list';
import { MailComposer } from '@/sections/mail/mail-composer';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const useLabels = (): Label[] => {
  const dispatch = useAppDispatch();
  const labels = useAppSelector((state) => state.mail.labels);

  const handleLabelsGet = useCallback((): void => {
    dispatch(thunks.getLabels());
    dispatch(thunks.getEmails('INBOX'));
  }, [dispatch]);

  useEffect(
    () => {
      handleLabelsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return labels;
};

interface ComposerState {
  isFullScreen: boolean;
  isOpen: boolean;
  message: string;
  subject: string;
  to: string;
}

const useComposer = () => {
  const initialState: ComposerState = {
    isFullScreen: false,
    isOpen: false,
    message: '',
    subject: '',
    to: '',
  };

  const [state, setState] = useState<ComposerState>(initialState);

  const handleOpen = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isOpen: true,
    }));
  }, []);

  const handleClose = useCallback(
    (): void => {
      setState(initialState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleMaximize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: true,
    }));
  }, []);

  const handleMinimize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: false,
    }));
  }, []);

  const handleMessageChange = useCallback(
    debounce((message: string): void => {
      setState((prevState) => ({
        ...prevState,
        message,
      }));
    }, 300), // 300ms delay
    []
  );

  const handleSubjectChange = useCallback(
    debounce((subject: string): void => {

      setState((prevState) => ({
        ...prevState,
        subject: subject
      }));
    }, 300),
    []
  );

  const handleToChange = useCallback(
    debounce((to: string): void => {
      setState((prevState) => ({
        ...prevState,
        to: to
      }));
    }, 300),
    []
  );

  return {
    ...state,
    handleClose,
    handleMaximize,
    handleMessageChange,
    handleMinimize,
    handleOpen,
    handleSubjectChange,
    handleToChange,
  };
};

const useSidebar = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mdUp]
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

const Page = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const emailId = searchParams.get('emailId');
  const currentLabelId = searchParams.get('label') || 'INBOX';
  const labels = useLabels();
  const composer = useComposer();
  const sidebar = useSidebar();
  const session = useSession();

  const view = emailId ? 'details' : 'list';

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
          <MailSidebar
            container={rootRef.current}
            currentLabelId={currentLabelId}
            labels={labels}
            onClose={sidebar.handleClose}
            onCompose={composer.handleOpen}
            open={sidebar.open}
          />
          <MailContainer open={sidebar.open}>
            {view === 'details' && (
              <MailThread
                emailId={emailId!}
                session={session.data!}
              />
            )}
            {view === 'list' && (
              <MailList
                currentLabelId={currentLabelId}
                onSidebarToggle={sidebar.handleToggle}
              />
            )}
          </MailContainer>
        </Box>
      </Box>
      <MailComposer
        maximize={composer.isFullScreen}
        message={composer.message}
        onClose={composer.handleClose}
        onMaximize={composer.handleMaximize}
        onMessageChange={composer.handleMessageChange}
        onMinimize={composer.handleMinimize}
        onSubjectChange={(e: any) => composer.handleSubjectChange(e)}
        onToChange={(e: any) => composer.handleToChange(e)}
        open={composer.isOpen}
        subject={composer.subject}
        to={composer.to}
      />
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
