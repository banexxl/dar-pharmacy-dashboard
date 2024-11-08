import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import ChevronLeftIcon from '@untitled-ui/icons-react/build/esm/ChevronLeft';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import RefreshCcw02Icon from '@untitled-ui/icons-react/build/esm/RefreshCcw02';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/mail';

import { MailItem } from './mail-item';
import { Email } from '@/schemas/mail';
import { paths } from 'paths';
import { Button, CircularProgress, Popover, TablePagination } from '@mui/material';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';


const useEmails = (currentLabelId?: string): { byId: Record<string, Email>; allIds: string[] } => {
  const dispatch = useDispatch();
  const { emails } = useSelector((state) => state.mail);
  useEffect(
    () => {
      dispatch(thunks.getEmails(currentLabelId!));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLabelId]
  );

  return emails;
};

interface SelectionModel {
  handleDeselectAll: () => void;
  handleDeselectOne: (emailId: string) => void;
  handleSelectAll: () => void;
  handleSelectOne: (emailId: string) => void;
  selected: string[];
}

const useSelectionModel = (emailIds: string[]): SelectionModel => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [emailIds]);

  const handleSelectAll = useCallback((): void => {
    setSelected([...emailIds]);
  }, [emailIds]);

  const handleSelectOne = useCallback((emailId: string): void => {
    setSelected((prevState) => {
      if (!prevState.includes(emailId)) {
        return [...prevState, emailId];
      }

      return prevState;
    });
  }, []);

  const handleDeselectAll = useCallback((): void => {
    setSelected([]);
  }, []);

  const handleDeselectOne = useCallback((emailId: string): void => {
    setSelected((prevState) => {
      return prevState.filter((id) => id !== emailId);
    });
  }, []);

  return {
    handleDeselectAll,
    handleDeselectOne,
    handleSelectAll,
    handleSelectOne,
    selected,
  };
};

interface MailListProps {
  currentLabelId?: string;
  onSidebarToggle?: () => void;
}

const useEmailSearch = () => {

  const [state, setState] = useState({
    query: '',
    page: 0,
    rowsPerPage: 5,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleQueryChange = useCallback((query: any) => {
    setState((prevState) => ({
      ...prevState,
      query,
    }));
  }, []);

  const handlePageChange = useCallback((event: any, newPage: number) => {
    setState((prevState) => ({
      ...prevState,
      page: newPage,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: any) => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  return {
    handleQueryChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

export const MailList: FC<MailListProps> = (props) => {
  const { currentLabelId, onSidebarToggle, ...other } = props;
  const dispatch = useDispatch();
  const emails = useEmails(currentLabelId);

  const emailSearch = useEmailSearch();

  const { handleDeselectAll, handleDeselectOne, handleSelectAll, handleSelectOne, selected } =
    useSelectionModel(emails.allIds);

  const handleToggleAll = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      if (event.target.checked) {
        handleSelectAll();
      } else {
        handleDeselectAll();
      }
    },
    [handleSelectAll, handleDeselectAll]
  );

  const selectedAll = selected.length === emails.allIds.length;
  const selectedSome = selected.length > 0 && selected.length < emails.allIds.length;
  const hasEmails = emails.allIds.length > 0;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMoreOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreOptionsClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  if (!emails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', margin: '20px' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  const handleDeleteEmailsClick = () => {

    if (selected.length === 0) {
      return toast.error('Morate odabrati bar jedan email za brisanje!');
    }

    Swal.fire({
      title: 'Da li ste sigurni?',
      text: 'Ova radnja je nepovratna! Svi odabrani emailovi će biti trajno obrisani.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da, obriši!',
      cancelButtonText: 'Ne, odustani!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        dispatch(thunks.deleteEmailsForever(selected));
      }
    })
  }

  const handleMoveEmailsToTrashClick = () => {

    if (selected.length === 0) {
      return toast.error('Morate odabrati bar jedan email za brisanje!');
    }

    Swal.fire({
      title: 'Da li ste sigurni?',
      text: 'Premeštanje emailova u korpu za otpatke će ih ukloniti iz trenutne fascikle.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da, obriši!',
      cancelButtonText: 'Ne, odustani!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        dispatch(thunks.deleteEmails(selected));
      }
    })
  }

  return (
    <Stack
      sx={{
        height: '100%',
        overflow: 'scroll',
      }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2 }}
      >
        <div>
          <IconButton onClick={onSidebarToggle}>
            <SvgIcon>
              <Menu01Icon />
            </SvgIcon>
          </IconButton>
        </div>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <OutlinedInput
            fullWidth
            placeholder="Pretraga po pošiljaocu"
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
            sx={{ width: 300 }}
            onChange={(e) => emailSearch.handleQueryChange(e.target.value)}
          />
          <Typography
            color="text.secondary"
            sx={{
              display: {
                xs: 'none',
                md: 'block',
              },
              mx: 2,
              whiteSpace: 'nowrap',
            }}
            variant="body2"
          >
            1 - {emails.allIds.length} of {emails.allIds.length}
          </Typography>
          <Tooltip title="Next page">
            <IconButton>
              <SvgIcon>
                <ChevronLeftIcon />
              </SvgIcon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Previous page">
            <IconButton>
              <SvgIcon>
                <ChevronRightIcon />
              </SvgIcon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => {
                dispatch(thunks.getEmails(currentLabelId!));
                dispatch(thunks.getLabels());
              }}
            >
              <SvgIcon>
                <RefreshCcw02Icon />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
      {hasEmails ? (
        <>
          <Box
            sx={{
              alignItems: 'center',
              borderBottomColor: 'divider',
              borderBottomStyle: 'solid',
              borderBottomWidth: 1,
              display: {
                xs: 'none',
                md: 'flex',
              },
              p: 2,
            }}
          >
            <Checkbox
              checked={selectedAll}
              indeterminate={selectedSome}
              onChange={handleToggleAll}
            />
            <Typography variant="subtitle2">Select all</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-describedby={id} onClick={handleMoreOptionsClick}>
              <SvgIcon>
                <DotsHorizontalIcon />
              </SvgIcon>
            </IconButton>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleMoreOptionsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Button
                  onClick={() => {
                    handleMoveEmailsToTrashClick();
                    handleMoreOptionsClose();
                    handleDeselectAll();
                  }}
                >
                  Move email(s) to Trash
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteEmailsClick();
                    handleMoreOptionsClose();
                    handleDeselectAll();
                  }}
                >
                  Delete email(s) forever
                </Button>
              </Box>
            </Popover>

          </Box>

          <div>
            {emails.allIds
              .slice(emailSearch.state.page * emailSearch.state.rowsPerPage, (emailSearch.state.page + 1) * emailSearch.state.rowsPerPage)
              .filter((emailSearch.state.query ? (emailId: string) => emails.byId[emailId].from.toLowerCase().includes(emailSearch.state.query.toLowerCase()) : () => true))
              .map((emailId: string) => {
                const isSelected = selected.includes(emailId);
                const href = paths.dashboard.email + `?emailId=${encodeURIComponent(emailId)}`;

                return (
                  <MailItem
                    email={emails.byId[emailId]}
                    href={href}
                    key={emailId} // Always use a stable key, not Math.random()
                    onDeselect={(): void => handleDeselectOne(emailId)}
                    onSelect={(): void => handleSelectOne(emailId)}
                    selected={isSelected}
                  />
                );
              })
            }

            <TablePagination
              component="div"
              count={emails.allIds.length}
              onPageChange={emailSearch.handlePageChange}
              onRowsPerPageChange={emailSearch.handleRowsPerPageChange}
              page={emailSearch.state.page}
              rowsPerPage={emailSearch.state.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              showFirstButton
              showLastButton
              labelRowsPerPage={'Broj po stranici'}
            />
          </div>
        </>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{
            flexGrow: 1,
            p: 2,
          }}
        >
          <Box
            component="img"
            src="/assets/errors/error-404.png"
            sx={{
              height: 'auto',
              maxWidth: 120,
            }}
          />
          <Typography color="text.secondary" variant="h5">
            No emails found in this folder
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

MailList.propTypes = {
  currentLabelId: PropTypes.string,
  onSidebarToggle: PropTypes.func,
};
