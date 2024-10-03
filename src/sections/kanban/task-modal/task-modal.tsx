import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import ArchiveIcon from '@untitled-ui/icons-react/build/esm/Archive';
import EyeIcon from '@untitled-ui/icons-react/build/esm/Eye';
import EyeOffIcon from '@untitled-ui/icons-react/build/esm/EyeOff';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Avatar from '@mui/material/Avatar';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { IconButton, MenuItem } from '@mui/material';
import type { RootState } from 'src/store';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/kanban';
import type { Attachment, CheckItem, Column, Member, Task } from 'src/schemas/kanban';
import { TaskChecklist } from './task-checklist';
import { TaskComment } from './task-comment';
import { TaskCommentAdd } from './task-comment-add';
import { TaskLabels } from './task-labels';
import { TaskStatus } from './task-status';
import { Autocomplete, FormControl, TextField } from '@mui/material';
import sweetalert2 from 'sweetalert2';
import { DatePicker } from '@mui/x-date-pickers';
import { createResourceId } from '@/utils/create-resource-id';
import { Session } from 'next-auth';
import { indigo } from '@/theme/colors';

const useColumns = (): Column[] => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    return Object.values(columns.byId);
  });
};

const useTask = (taskId?: string): Task | null => {
  return useSelector((state: RootState) => {
    const { tasks } = state.kanban;

    if (!taskId) {
      return null;
    }

    return tasks.byId[taskId] || null;
  });
};

const useColumn = (columnId?: string): Column | null => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    if (!columnId) {
      return null;
    }

    return columns.byId[columnId] || null;
  });
};

// const useAuthor = (authorId?: string): Member | null => {

//   return useSelector((state: RootState) => {
//     const { members } = state.kanban;
//     if (!authorId) {
//       return null;
//     }
//     return members.byId[authorId] || null;
//   });
// };

const useAssignees = (assigneesIds?: string[]): Member[] => {
  return useSelector((state: RootState) => {
    const { members } = state.kanban;

    if (!assigneesIds) {
      return [];
    }

    return assigneesIds
      .map((assigneeId: string) => members.byId[assigneeId])
      .filter((assignee) => !!assignee);
  });
};

interface TaskModalProps {
  onClose?: () => void;
  open?: boolean;
  taskId?: string;
  boardId: string;
  members?: Member[];
  userLoggedIn: Session
}

export const TaskModal: FC<TaskModalProps> = (props) => {
  const { taskId, onClose, open = false, boardId, members, userLoggedIn, ...other } = props;

  const dispatch = useDispatch();
  const columns = useColumns();
  const task = useTask(taskId);
  const column = useColumn(task?.columnId);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const chipRef = useRef(null);
  const assignedTo = useAssignees(task?.assignedTo.map((assignee) => assignee._id!.toString()) || []);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [nameCopy, setNameCopy] = useState<string>(task?.name || '');
  const debounceMs = 1000;
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: any) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    // Validate file type
    const validExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Nedozvoljen tip fajla! Dozvoljeni tipovi su: pdf, docx, doc, jpg, jpeg, png, gif');
      return;
    }

    setLoading(true);
    const apiUrl = '/api/aws/aws-s3';

    try {
      const reader = new FileReader();

      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const data = {
          file: base64Data,
          extension: fileExtension,
          fileName: selectedFile.name,
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          toast.error('Došlo je do greške prilikom uploada fajla!');
        } else {
          const result = await response.json();
          const attachment: Attachment = {
            _id: createResourceId(),
            uploadedDateTime: new Date(),
            type: validExtensions.includes(fileExtension) ? 'image' : 'file',
            url: result.imageUrl,
          };

          // Dispatch updateTask thunk with the new attachment
          dispatch(
            thunks.updateTask({
              boardId: boardId.toString(),
              taskId: task!._id!.toString(),
              update: {
                attachments: [...task!.attachments, attachment],
              },
            })
          );

          toast.success('Uspešno uploadovan fajl!');
        }
      };
    } catch (error) {
      toast.error('Došlo je do greške prilikom uploada fajla!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileURL: string) => {
    if (!fileURL) {
      return;
    }

    setLoading(true);
    const apiUrl = '/api/aws/aws-s3';

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fileURL }),
      });

      if (!response.ok) {
        toast.error('Došlo je do greške prilikom brisanja fajla!');
      } else {
        const updatedAttachments = task!.attachments.filter((attachment) => attachment.url !== fileURL);

        // Dispatch updateTask thunk to update the attachments
        dispatch(
          thunks.updateTask({
            boardId: boardId!.toString(),
            taskId: task!._id!.toString(),
            update: {
              attachments: updatedAttachments,
            },
          })
        );

        toast.success('Uspešno obrisan fajl!');
      }
    } catch (error) {
      toast.error('Došlo je do greške prilikom brisanja fajla!');
    } finally {
      setLoading(false);
    }
  };

  const onFileClick = (fileURL: string) => {
    sweetalert2.fire({
      title: 'Da li ste sigurni da želite da obrišete publikaciju?',
      text: "Možete obrisati samo publikaciju koju ste uploadovali!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Da, obriši!',
      cancelButtonText: 'Odustani!'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteFile(fileURL)
      } else {
        // handleProjectClose()
      }
    })
  }

  const handleDateChange = (newDate: Date) => {
    dispatch(
      thunks.updateTask({
        boardId: boardId!.toString(),
        taskId: task!._id!.toString(),
        update: {
          due: new Date(newDate),
        },
      })
    );
    toast.success('Datum uspešno ažuriran!');
  };

  const handleTabsReset = useCallback(() => {
    setCurrentTab('overview');
  }, []);

  // Reset tab on task change
  useEffect(
    () => {
      handleTabsReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taskId]
  );

  const handleNameReset = useCallback(() => {
    setNameCopy(task?.name || '');
  }, [task]);

  // Reset task name copy
  useEffect(
    () => {
      handleNameReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task]
  );

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value);
  }, []);

  const handleMove = useCallback(
    async (columnId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.moveTask({
            boardId: boardId!.toString(),
            taskId: task!._id!.toString(),
            position: 0,
            sourceColumnId: task!.columnId!.toString(),
            destinationColumnId: columnId,
          })
        );
        onClose?.();
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task, onClose]
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    onClose?.();
    sweetalert2.fire({
      title: 'Da li zaista želite da obrišete zadatak?',
      text: 'Ova akcija je nepovratna!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da, obriši!',
      cancelButtonText: 'Odustani!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(
            thunks.deleteTask({
              boardId: boardId!.toString(),
              taskId: task!._id!.toString(),
            })
          );
          onClose?.();
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
        }
      }
    })
  }, [dispatch, task, onClose])

  const handleNameUpdate = useCallback(
    async (name: string) => {
      try {
        await dispatch(
          thunks.updateTask({
            boardId: boardId!.toString(),
            taskId: task!._id!.toString(),
            update: {
              name,
            },
          })
        );
        toast.success('Uspešno ažuriranje zadatka!');
      } catch (err) {
        console.error(err);
        toast.error('Ne uspešno ažuriranje zadatka!');
      }
    },
    [dispatch, task]
  );

  const handleNameBlur = useCallback(() => {
    if (!nameCopy) {
      setNameCopy(task!.name);
      return;
    }

    if (nameCopy === task!.name) {
      return;
    }

    handleNameUpdate(nameCopy);
  }, [task, nameCopy, handleNameUpdate]);

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setNameCopy(event.target.value);
  }, []);

  const handleNameKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.code === 'Enter') {
        if (nameCopy && nameCopy !== task!.name) {
          handleNameUpdate(nameCopy);
        }
      }
    },
    [task, nameCopy, handleNameUpdate]
  );

  const handleAssignMember = (selectedMember: Member) => {
    if (!selectedMember) return;
    if (task!.assignedTo.some((member) => member._id === selectedMember._id)) {
      setSelectedMember(null); // Clear the selected member
      toast.error('Član je već dodat!'); // Show error message if the member is already assigned
      return; // Do nothing if the member is already assigned
    }

    dispatch(thunks.updateTask({
      boardId: boardId!.toString(),
      taskId: task!._id!.toString(),
      update: {
        assignedTo: [...task!.assignedTo, selectedMember] // Add selected member to the task's assigned members list
      }

    }));
    setSelectedMember(null); // Clear the selected member
  };

  const handleRemoveMember = (member: Member) => {
    dispatch(thunks.updateTask({
      boardId: boardId!.toString(),
      taskId: task!._id!.toString(),
      update: {
        assignedTo: task!.assignedTo.filter((assignee) => assignee._id !== member._id) // Remove the selected member from the task's assigned members list
      }
    }));
    toast.success('Član uspešno uklonjen!'); // Show success message
  }

  const handleDescriptionUpdate = useMemo(
    () =>
      debounce(async (description: string) => {
        try {
          await dispatch(
            thunks.updateTask({
              boardId: boardId!.toString(),

              taskId: task!._id!.toString(),
              update: {
                description,
              },
            })
          );
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
        }
      }, debounceMs),
    [dispatch, task]
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      handleDescriptionUpdate(event.target.value);
    },
    [handleDescriptionUpdate]
  );

  const handleSubscribe = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.updateTask({
          boardId: boardId!.toString(),

          taskId: task!._id!.toString(),
          update: { isSubscribed: true },
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task]);

  const handleUnsubscribe = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.updateTask({
          boardId: boardId!.toString(),

          taskId: task!._id!.toString(),
          update: { isSubscribed: false },
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task]);

  const handleLabelsChange = useCallback(
    async (labels: string[]): Promise<void> => {
      try {
        await dispatch(
          thunks.updateTask({
            boardId: boardId!.toString(), // Add the boardId to the updateTask thunk
            taskId: task!._id!.toString(),
            update: {
              labels,
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  // const handleChecklistAdd = useCallback(async (): Promise<void> => {
  //   try {
  //     await dispatch(
  //       thunks.addChecklist({
  //         boardId: boardId!.toString(),
  //         taskId: task!._id!.toString(),
  //         checklist: {
  //           name: 'Lista zadataka',
  //           checkItems: [],
  //         }
  //       })
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     toast.error('Kreiranje liste nije uspelo!');
  //   }
  // }, [dispatch, task]);

  const handleChecklistRename = useCallback(async (taskId: string, name: string): Promise<void> => {

    if (!name || name.trim() === '') {
      toast.error('Ime liste ne može biti prazno!');
      return;
    }
    try {
      await dispatch(
        thunks.updateChecklist({
          taskId: taskId,
          update: {
            name: name,
          },
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch, task]
  );

  const handleChecklistDelete = useCallback(async (taskId: string): Promise<void> => {

    try {
      await dispatch(
        thunks.deleteChecklist({
          taskId: taskId
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }

  },
    [dispatch, task]
  );

  const handleCheckItemAdd = useCallback(async (boardId: string, taskId: string, name: string): Promise<void> => {
    const checkItemID = createResourceId()
    const checkItem: CheckItem = {
      _id: checkItemID,
      name: name,
      state: 'incomplete',
    }
    try {

      const addCheckItemResponse = fetch('/api/kanban/checklist/check-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boardId: boardId, taskId: taskId, checkItem: checkItem }),
      })

      if ((await addCheckItemResponse).status === 200) {
        await dispatch(
          thunks.addCheckItem({
            boardId: boardId,
            taskId: taskId,
            checkItem: checkItem
          })
        );
        toast.success('Stavka za listu uspešno dodata!');
      } else {
        toast.error('Dodavanje stavke za listu nije uspelo!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Dodavanje stavke za listu nije uspelo!');
    }
  },
    [dispatch, task]
  );

  const handleCheckItemDelete = useCallback(async (boardId: string, taskId: string, checkItemId: string): Promise<void> => {
    try {
      await dispatch(
        thunks.deleteCheckItem({
          boardId,
          taskId,
          checkItemId,
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch, task]
  );

  const handleCheckItemCheck = useCallback(
    async (boardId: string, taskId: string, checkItemId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            boardId: boardId,
            taskId: taskId,
            checkItemId,
            update: {
              state: 'complete',
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemUncheck = useCallback(
    async (taskId: string, checkItemId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            boardId: boardId,
            taskId: taskId,
            checkItemId,
            update: {
              state: 'incomplete',
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemRename = useCallback(
    async (taskId: string, checkItemId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            boardId: boardId,
            taskId: taskId,
            checkItemId,
            update: {
              name,
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCommentAdd = useCallback(
    async (message: string): Promise<void> => {
      try {
        const res = await fetch('/api/kanban/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ boardId: boardId, taskId: taskId, message: message, userLoggedIn: userLoggedIn.user?.email }),
        })

        if (res.status === 200) {
          await dispatch(
            thunks.addComment({
              boardId: boardId,
              taskId: task!._id!.toString(),
              comment: {
                message: message,
                authorId: userLoggedIn.user?.email!,
                createdAt: new Date(),
              },
            })
          );
        }

      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const statusOptions = useMemo(() => {
    return columns.map((column) => {
      return {
        label: column.name!,
        value: column._id!,
      };
    });
  }, [columns]);

  const content =
    task && column ? (
      <>
        <Stack
          alignItems={{
            sm: 'center',
          }}
          direction={{
            xs: 'column-reverse',
            sm: 'row',
          }}
          justifyContent={{
            sm: 'space-between',
          }}
          spacing={1}
          sx={{ p: 3 }}
        >
          <div>
            <TaskStatus
              onChange={(columnId) => handleMove(columnId)}
              options={statusOptions}
              value={column._id!.toString().toString()}
            />
          </div>
          <Stack
            justifyContent="flex-end"
            alignItems="center"
            direction="row"
            spacing={1}
          >
            {task.isSubscribed ? (
              <IconButton onClick={handleUnsubscribe}>
                <SvgIcon>
                  <EyeOffIcon />
                </SvgIcon>
              </IconButton>
            ) : (
              <IconButton onClick={handleSubscribe}>
                <SvgIcon>
                  <EyeIcon />
                </SvgIcon>
              </IconButton>
            )}
            <IconButton onClick={handleDelete}>
              <SvgIcon>
                <ArchiveIcon />
              </SvgIcon>
            </IconButton>
            {!mdUp && (
              <IconButton onClick={onClose}>
                <SvgIcon>
                  <XIcon />
                </SvgIcon>
              </IconButton>
            )}
          </Stack>
        </Stack>
        <Box sx={{ px: 1 }}>
          <Input
            disableUnderline
            fullWidth
            onBlur={handleNameBlur}
            onChange={handleNameChange}
            onKeyUp={handleNameKeyUp}
            placeholder="Task name"
            sx={(theme) => ({
              ...theme.typography.h6,
              '& .MuiInputBase-input': {
                borderRadius: 1.5,
                overflow: 'hidden',
                px: 2,
                py: 1,
                textOverflow: 'ellipsis',
                wordWrap: 'break-word',
                '&:hover, &:focus': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
                },
              },
            })}
            value={nameCopy}
          />
        </Box>
        <Tabs
          onChange={handleTabsChange}
          sx={{ px: 3 }}
          value={currentTab}
        >
          <Tab
            value="overview"
            label="Overview"
          />
          <Tab
            value="checklist"
            label="Checklist"
          />
          <Tab
            value="comments"
            label="Comments"
          />
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {currentTab === 'overview' && (
            <Grid
              container
              spacing={3}
            >
              {/* Created */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Created by
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <Typography color="text.secondary" variant="caption">
                  {task.createdBy.name}
                </Typography>
              </Grid>
              {/* Assigned to */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Assigned to
                </Typography>
              </Grid>
              <Grid xs={12} sm={8}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <FormControl fullWidth>
                    <Autocomplete
                      value={selectedMember} // Track the selected member
                      onChange={(event, newValue) => setSelectedMember(newValue)} // Handle member selection
                      options={members || []}
                      getOptionLabel={(member: Member) => member.name}
                      renderOption={(props, member: Member) => (
                        <MenuItem {...props}>
                          <Typography color="text.secondary" variant="caption">
                            {member.name}
                          </Typography>
                        </MenuItem>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Member"
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                  <IconButton
                    onClick={() => handleAssignMember(selectedMember!)} // Call the function when clicked
                    sx={{ ml: 1 }}
                    disabled={!selectedMember} // Disable if no member selected
                  >
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  </IconButton>
                </Stack>
                <Box mt={2}>
                  <Stack direction="column" spacing={1} flexWrap="wrap">
                    {assignedTo.map((member: Member) => (
                      <Stack key={member._id} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                        <Avatar src={member.avatar || ''} alt={member.name} />
                        <Typography color="text.secondary" variant="caption">{member.name}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMember(member)} // Function to remove member
                        >
                          <SvgIcon fontSize="small">
                            <PersonRemoveIcon /> {/* Use an appropriate remove icon */}
                          </SvgIcon>
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              {/* Attachments */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Attachments
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                >
                  {task.attachments.map((attachment) => (
                    <Avatar
                      key={attachment._id!.toString().toString()}
                      src={attachment.url || undefined}
                      sx={{
                        height: 64,
                        width: 64,
                      }}
                      variant="rounded"
                    />
                  ))}
                  <Button component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon sx={{ fontWeight: 'bold', color: indigo.lightest }} />}
                    style={{ maxWidth: '250px', marginTop: '40px', color: indigo.main, textDecoration: 'none' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: indigo.lightest }}>
                      Učitaj dokument
                    </Typography>
                    <Input
                      type="file"
                      inputProps={{ accept: '.pdf, .docx, .doc, .gif, .jpg, .jpeg, .jfif' }}
                      sx={{
                        clip: 'rect(0 0 0 0)',
                        clipPath: 'inset(50%)',
                        height: 1,
                        overflow: 'hidden',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        whiteSpace: 'nowrap',
                        width: 1,
                      }}
                      onChange={(e: any) => handleFileChange(e)}
                    />
                  </Button>
                  {/* Hidden file input */}

                </Stack>
              </Grid>
              {/* Due Date */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Due date
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                {task.due && (
                  <>
                    <Chip
                      size="small"
                      label={task.due ? format(new Date(task.due), 'MMM dd, yyyy') : 'No Due Date'}
                      onClick={() => setOpenDatePicker(true)} // Open the date picker when clicked  
                      ref={chipRef}
                    />
                    <DatePicker
                      open={openDatePicker}
                      value={task?.due}
                      onChange={(newValue: any) => handleDateChange(newValue)}
                      onClose={() => setOpenDatePicker(false)} // Close the picker when clicked outside
                      PopperProps={{
                        anchorEl: chipRef.current, // Position the calendar relative to the chip
                        placement: 'bottom-start', // Opens below the chip
                      }}
                      renderInput={(params) => <div style={{ display: 'none' }} />} // Hides the default input
                    />
                  </>
                )}
              </Grid>
              {/* Labels */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Labels
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <TaskLabels
                  labels={task.labels}
                  onChange={handleLabelsChange}
                />
              </Grid>
              {/* Description */}
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Description
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <Input
                  defaultValue={task.description}
                  fullWidth
                  multiline
                  disableUnderline
                  onChange={handleDescriptionChange}
                  placeholder="Leave a message"
                  rows={6}
                  sx={{
                    borderColor: 'divider',
                    borderRadius: 1,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    p: 1,
                  }}
                />
              </Grid>
            </Grid>
          )}
          {currentTab === 'checklist' && (
            <Stack spacing={2}>
              <TaskChecklist
                key={task.checklist?._id?.toString()}
                checklist={task.checklist}
                onCheckItemAdd={(name) => handleCheckItemAdd(boardId, task._id!.toString(), name)}
                onCheckItemDelete={(checkItemId) => handleCheckItemDelete(boardId, task._id!.toString(), checkItemId)}
                onCheckItemCheck={(checkItemId) => handleCheckItemCheck(boardId, task._id!.toString(), checkItemId)}
                onCheckItemUncheck={(checkItemId) => handleCheckItemUncheck(task._id!.toString(), checkItemId)}
                onCheckItemRename={(checkItemId, name) => handleCheckItemRename(task._id!.toString(), checkItemId, name)}
                onDelete={() => handleChecklistDelete(task._id!.toString())}
                onRename={(name) => handleChecklistRename(task._id!.toString(), name)}
              />
            </Stack>
          )}
          {currentTab === 'comments' && (
            <Stack spacing={2}>
              {task.comments.length > 0 && task.comments.map((comment) => (
                <TaskComment
                  key={comment?._id?.toString()}
                  comment={comment}
                />
              ))}
              <TaskCommentAdd
                avatar={
                  members?.find((member) => member.email === userLoggedIn.user?.email)?.avatar!
                }
                onAdd={handleCommentAdd}
              />
            </Stack>
          )}
        </Box>
      </>
    ) : null;
  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 500,
        },
      }}
      {...other}
    >
      {content}
    </Drawer>
  );
};

TaskModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  taskId: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  members: PropTypes.array,
  userLoggedIn: PropTypes.shape({
    user: PropTypes.shape({
      email: PropTypes.string.isRequired,
      image: PropTypes.string,
      name: PropTypes.string.isRequired
    }).isRequired,
    expires: PropTypes.string.isRequired
  }).isRequired
};
