import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useDispatch, useSelector } from 'src/store';
import { TaskModal } from '@/sections/kanban/task-modal';
import { ColumnAdd } from '@/sections/kanban/column-add';
import { ColumnCard } from '@/sections/kanban/column-card';
import { thunks } from '@/thunks/kanban';
import { KanbanService } from '@/services/kanban-services';
import { Board } from '@/schemas/kanban';
import { Button, Divider, Modal, TextField, Theme, useMediaQuery } from '@mui/material';
import { indigo } from '@/theme/colors';
import sweetalert2 from 'sweetalert2';
import { useRouter } from 'next/router';

const useColumnsIds = (): string[] => {
  const { columns } = useSelector((state: any) => state.kanban);
  return columns.allIds;
};

const useBoard = (boardId: string | null | undefined): void => {
  const dispatch = useDispatch();
  const handleBoardGet = useCallback((boardId: string): void => {
    if (boardId) {
      dispatch(thunks.getBoard(boardId));
    }
  },
    [dispatch]
  );

  useEffect(() => {
    if (boardId) {  // Properly check if boardId is not null or empty
      handleBoardGet(boardId);  // Corrected typo to 'handleBoardGet'
    }
  }, [boardId, handleBoardGet]);
};

type PageProps = {
  boards: Board[];
};

const Page = ({ boards }: PageProps) => {
  const dispatch = useDispatch();
  const columnsIds = useColumnsIds();
  const router = useRouter();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();
  // Fetch board data whenever the selected board changes
  useBoard(selectedBoardId);

  const handleBoardChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedBoardId(event.target.value as string);
  };

  const handleDragEnd = useCallback(async ({ source, destination, draggableId }: DropResult): Promise<void> => {
    try {
      if (!destination) {
        return;
      }

      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      if (source.droppableId === destination.droppableId) {
        await dispatch(
          thunks.moveTask({
            taskId: draggableId,
            position: destination.index,
          })
        );
      } else {
        await dispatch(
          thunks.moveTask({
            taskId: draggableId,
            position: destination.index,
            columnId: destination.droppableId,
          })
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch]
  );

  const handleColumnAdd = useCallback(async (boardId: string, name?: string) => {
    const trimmedColumn = name?.trim(); // Corrected typo to 'trimmedColumn'

    if (!name || trimmedColumn === "") {  // Check for empty or whitespace-only names
      sweetalert2.fire({
        icon: 'error',
        title: 'Naziv kolone ne može biti prazan',
        allowEscapeKey: true,
        allowOutsideClick: true,
      });
    } else {
      try {
        //dispatch(thunks.getBoard(boardId));
        dispatch(thunks.createColumn({ name: name, boardId })); // Dispatch thunk to create column
      } catch (err: any) {
        sweetalert2.fire({
          icon: 'error',
          title: 'Greška prilikom dodavanja kolone',
          allowEscapeKey: true,
          allowOutsideClick: true,
          text: err.toString(),
        });
      }
    }
  }, [dispatch]
  );

  const handleColumnClear = useCallback(async (columnId: string): Promise<void> => {
    try {
      await dispatch(
        thunks.clearColumn({
          columnId,
        })
      );
      toast.success('Column cleared');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch]
  );

  const handleColumnDelete = useCallback(async (columnId: string): Promise<void> => {
    try {
      await dispatch(
        thunks.deleteColumn({
          columnId,
        })
      );
      toast.success('Column deleted');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch]
  );

  const handleColumnRename = useCallback(async (columnId: string, name: string): Promise<void> => {
    try {
      await dispatch(
        thunks.updateColumn({
          columnId,
          update: { name },
        })
      );
    } catch (err: any) {
      sweetalert2.fire({
        icon: 'error',
        title: 'Failed to update column',
        allowEscapeKey: true,
        allowOutsideClick: true,
        text: err.toString(),
      })
    }
  },
    [dispatch]
  );

  const handleTaskAdd = useCallback(async (columnId: string, name?: string): Promise<void> => {
    try {
      await dispatch(
        thunks.createTask({
          columnId,
          name: name || 'Untitled Task',
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  },
    [dispatch]
  );

  const handleTaskOpen = useCallback((taskId: string): void => {
    setCurrentTaskId(taskId);
  }, []
  );

  const handleTaskClose = useCallback((): void => {
    setCurrentTaskId(null);
  }, []
  );

  const [openModal, setOpenModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [error, setError] = useState('');
  const isScreentoMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSubmit = async () => {
    if (!boardName) {
      setError('Board name is required');
      return;
    }
    setError('');

    try {
      const addBoardResponse = await fetch('/api/kanban/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: boardName }),
      });
      // Optionally, refresh the list of boards after successful creation
      const newBoard = await addBoardResponse.json();
      if (newBoard.acknowledged && newBoard.insertedId !== '') {
        sweetalert2.fire({
          icon: 'success',
          title: 'Tabla kreirana',
          allowEscapeKey: true,
          allowOutsideClick: true,
        })
        router.reload();
      } else {
        sweetalert2.fire({
          icon: 'error',
          title: 'Greška prilikom kreiranja table',
          allowEscapeKey: true,
          allowOutsideClick: true,
        })
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden',
          pt: 8,
        }}
      >
        <Box sx={{ px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: isScreentoMedium ? 'column' : 'row', gap: '20px' }}>
            <Typography variant="h4" gutterBottom>
              Kanban Tabla
            </Typography>
            {/* Button to open the modal */}
            <Button variant="contained" onClick={handleOpenModal} sx={{ maxWidth: '200px', marginBottom: '20px' }}>
              Dodaj novu tablu
            </Button>
          </Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              select
              value={selectedBoardId || ''}
              onChange={handleBoardChange}
              label="Izaberi tablu"
            >
              <MenuItem key="clear" value="" onSelect={() => setSelectedBoardId(null)}>
                Očisti izbor
              </MenuItem>
              {boards.map((board: Board) => (
                <MenuItem key={board._id.toString()} value={board._id!.toString()}>
                  {board.title}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
          {/* Modal for adding a new board */}
          <Modal open={openModal} onClose={handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                p: 4,
                boxShadow: 24,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Kreiraj novu tablu
              </Typography>
              <TextField
                label="Naziv table"
                fullWidth
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                required
                error={!!error}
                helperText={error}
                sx={{ mb: 3 }}
              />
              <Button variant="contained" onClick={handleSubmit}>
                Kreiraj
              </Button>
              <Button variant="outlined" onClick={handleCloseModal} sx={{ ml: 2 }}>
                Otkaži
              </Button>
            </Box>
          </Modal>
        </Box>
        <Divider sx={{ borderBottomWidth: '2px', borderColor: indigo.dark }} />
        {
          selectedBoardId && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box
                sx={{
                  display: 'flex',
                  flexGrow: 1,
                  flexShrink: 1,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  px: 3,
                  py: 3,
                }}
              >
                <Stack alignItems="flex-start" direction="row" spacing={3}>
                  {columnsIds.map((columnId: string) => (
                    <ColumnCard
                      key={columnId}
                      columnId={columnId}
                      onClear={() => handleColumnClear(columnId)}
                      onDelete={() => handleColumnDelete(columnId)}
                      onRename={(name) => handleColumnRename(columnId, name)}
                      onTaskAdd={(name) => handleTaskAdd(columnId, name)}
                      onTaskOpen={handleTaskOpen}
                    />
                  ))}
                  <ColumnAdd onAdd={(e) => handleColumnAdd(selectedBoardId, e)} />
                </Stack>
              </Box>
            </DragDropContext>
          )
        }
      </Box>
      <TaskModal
        onClose={handleTaskClose}
        open={!!currentTaskId}
        taskId={currentTaskId || undefined}
      />
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = async () => {
  const boards = await KanbanService().getAllBoards();

  const serializedBoards = boards.map((board: Board) => ({
    ...board,
    _id: board._id.toString(),  // Convert ObjectId to string
  }));

  return {
    props: {
      boards: serializedBoards || [],
    },
  };
};