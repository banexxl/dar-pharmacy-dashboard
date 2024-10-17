import { useCallback, useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { Label } from '@/schemas/mail';
import { useDispatch, useSelector } from '@/store';
import { thunks } from '@/thunks/mail';
import { MailSidebar } from '@/sections/mail/mail-sidebar';
import { MailContainer } from '@/sections/mail/mail-container';
import { MailThread } from '@/sections/mail/mail-thread';
import { MailList } from '@/sections/mail/mail-list';
import { MailComposer } from '@/sections/mail/mail-composer';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useSearchParams } from 'next/navigation';

const useLabels = (): Label[] => {


  const dispatch = useDispatch();
  const labels = useSelector((state) => state.mail.labels);

  const handleLabelsGet = useCallback((): void => {
    dispatch(thunks.getLabels());
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

  const handleMessageChange = useCallback((message: string): void => {
    setState((prevState) => ({
      ...prevState,
      message,
    }));
  }, []);

  const handleSubjectChange = useCallback((subject: string): void => {
    setState((prevState) => ({
      ...prevState,
      subject,
    }));
  }, []);

  const handleToChange = useCallback((to: string): void => {
    setState((prevState) => ({
      ...prevState,
      to,
    }));
  }, []);

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
  const currentLabelId = searchParams.get('label') || undefined;
  const labels = useLabels();
  const composer = useComposer();
  const sidebar = useSidebar();

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
                currentLabelId={currentLabelId}
                emailId={emailId!}
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
        onSubjectChange={composer.handleSubjectChange}
        onToChange={composer.handleToChange}
        open={composer.isOpen}
        subject={composer.subject}
        to={composer.to}
      />
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
