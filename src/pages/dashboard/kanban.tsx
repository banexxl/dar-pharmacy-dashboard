import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import toast, { Toaster } from 'react-hot-toast';
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
import { Board, Column, Member, Task } from '@/schemas/kanban';
import { Button, Divider, Modal, TextField, Theme, useMediaQuery } from '@mui/material';
import { indigo } from '@/theme/colors';
import sweetalert2 from 'sweetalert2';
import { useSession } from 'next-auth/react';
import { createResourceId } from '@/utils/create-resource-id';


const useColumnsIds = (): string[] => {
  const { columns } = useSelector((state: any) => state.kanban);
  return columns.allIds;
};

const useBoard = (boardId: string | null | undefined): void => {
  const dispatch = useDispatch();

  const handleBoardGet = useCallback((boardId: string): void => {
    if (boardId) {
      dispatch(thunks.getBoard(boardId))
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
  const columnIds = useColumnsIds();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>();
  const [boardData, setBoardData] = useState<Board[]>(boards);
  const session = useSession();
  const [openModal, setOpenModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [error, setError] = useState('');
  const isScreentoMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  // Fetch board data whenever the selected board changes
  useBoard(selectedBoardId);

  const handleBoardChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedBoardId(event.target.value as string);
  };

  const handleDeleteBoard = async () => {
    await sweetalert2.fire({
      title: 'Upozorenje!',
      text: "Da li stvarno želite da obrišete tablu?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da!',
      cancelButtonText: 'Ne!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        await dispatch(thunks.deleteBoard(selectedBoardId!));
        //Set selected board to an existing board
        setBoardData((prev) => {
          const newBoardData = prev.filter((board) => board._id !== selectedBoardId);
          if (newBoardData.length > 0) {
            setSelectedBoardId(newBoardData[0]._id);
          } else {
            setSelectedBoardId(null);
          }
          return newBoardData;
        });
      }
    })
  };

  const handleColumnAdd = useCallback(async (boardId: string, name: string) => {
    const trimmedColumn = name?.trim(); // Corrected typo to 'trimmedColumn'
    const columnId = createResourceId()
    if (!name || trimmedColumn === "") {  // Check for empty or whitespace-only names
      toast.error('Naziv kolone je obavezan!');
    } else {
      await dispatch(thunks.createColumn({ _id: columnId, boardId: boardId, name: name, taskIds: [] })); // Dispatch thunk to create column
    }
  }, [dispatch]
  );

  const handleColumnDelete = useCallback(async (selectedBoardId: string, columnId: string): Promise<void> => {

    sweetalert2.fire({
      title: 'Upozorenje!',
      text: "Da li stvarno želite da obrišete kolonu?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da!',
      cancelButtonText: 'Ne!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        await dispatch(thunks.deleteColumn({ boardId: selectedBoardId!, columnId: columnId }));
      }
    })

  },
    [dispatch]
  );

  const handleColumnClear = useCallback(async (columnId: string): Promise<void> => {
    sweetalert2.fire({
      title: 'Upozorenje!',
      text: "Da li stvarno želite da ispraznite sve task-ve iz kolone?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da!',
      cancelButtonText: 'Ne!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        await dispatch(thunks.clearColumn({ columnId }))
      }
    })
  },
    [dispatch]
  );

  const handleColumnRename = useCallback(async (boardId: string, columnId: string, name: string): Promise<void> => {
    await dispatch(thunks.updateColumn({ columnId, boardId, name, }));
  },
    [dispatch]
  );

  const handleTaskAdd = useCallback(async (boardId: string, columnId: string, name: string, createdBy: string): Promise<void> => {
    await dispatch(thunks.createTask({ boardId, columnId, name, createdBy }))
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
        setBoardData([
          ...boardData,
          { _id: newBoard.insertedId, title: boardName, columns: [], tasks: [], members: [] },
        ]);
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

              {boardData.map((board: Board) => (
                <MenuItem key={board._id!.toString()} value={board._id!.toString()} sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                  {
                    columnIds &&
                    columnIds.map((columnId: string) => (
                      <ColumnCard
                        key={columnId}
                        columnId={columnId}
                        onClear={() => handleColumnClear(columnId)}
                        onDelete={() => handleColumnDelete(selectedBoardId, columnId)}
                        onRename={(name) => handleColumnRename(selectedBoardId, columnId, name)}
                        onTaskAdd={(name) => handleTaskAdd(selectedBoardId, columnId, name!, session.data!.user!.name!)}
                        onTaskOpen={handleTaskOpen}
                      />
                    ))}
                  <ColumnAdd onAdd={(e) => handleColumnAdd(selectedBoardId, e)} />
                </Stack>
              </Box>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDeleteBoard()}
                style={{ margin: '30px', maxWidth: '200px' }}
              >
                Obriši tablu
              </Button>
            </DragDropContext>
          )
        }
      </Box>
      <TaskModal
        onClose={handleTaskClose}
        open={!!currentTaskId}
        boardId={selectedBoardId || undefined}
        taskId={currentTaskId || undefined}
      />
      <Toaster />
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = async () => {

  const boards = await KanbanService().getAllBoards();

  // const columnIdsByBoards = boards.map((board: Board) => board.columns.map((column: Column) => column?._id!.toString()));

  // const taskIdsFromBoardByColumn = boards.map((board: Board) => board.columns.map((column: Column) => column?.taskIds!.map((taskId: string) => taskId.toString())));

  const serializedBoards = boards.map((board: Board) => ({
    ...board,
    _id: board._id!.toString(),  // Convert ObjectId to string
  }));

  return {
    props: {
      boards: serializedBoards || [],
      // columnIds: columnIdsByBoards || [],
      // taskIds: taskIdsFromBoardByColumn[0] && taskIdsFromBoardByColumn[0].length > 0 ? taskIdsFromBoardByColumn[0][0] : [],
    },
  };
};