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
import { Divider, TextField } from '@mui/material';
import { indigo } from '@/theme/colors';

const useColumnsIds = (): string[] => {
  const { columns } = useSelector((state: any) => state.kanban);
  return columns.allIds;
};

const useBoard = (board: Board | null | undefined): void => {
  console.log('usao u useBoard na glavnoj strnici', board);

  const dispatch = useDispatch();

  const handleBoardGet = useCallback((boardId: string): void => {
    if (boardId) {
      dispatch(thunks.getBoard(boardId));
    }
  },
    [dispatch]
  );

  useEffect(() => {
    if (board) {  // Properly check if boardId is not null or empty
      handleBoardGet(board._id);
    }
  }, [board, handleBoardGet]);
};

type PageProps = {
  boards: Board[];
};

const Page = ({ boards }: PageProps) => {
  const dispatch = useDispatch();
  const columnsIds = useColumnsIds();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>();
  // Fetch board data whenever the selected board changes
  useBoard(selectedBoard);

  const handleBoardChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedBoard(event.target.value as Board);
  };

  const handleDragEnd = useCallback(
    async ({ source, destination, draggableId }: DropResult): Promise<void> => {
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

  const handleColumnAdd = useCallback(
    async (name?: string) => {
      try {
        await dispatch(
          thunks.createColumn({
            name: name || 'Untitled Column',
          })
        );
        toast.success('Column created');
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch]
  );

  const handleColumnClear = useCallback(
    async (columnId: string): Promise<void> => {
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

  const handleColumnDelete = useCallback(
    async (columnId: string): Promise<void> => {
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

  const handleColumnRename = useCallback(
    async (columnId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateColumn({
            columnId,
            update: { name },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch]
  );

  const handleTaskAdd = useCallback(
    async (columnId: string, name?: string): Promise<void> => {
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
  }, []);

  const handleTaskClose = useCallback((): void => {
    setCurrentTaskId(null);
  }, []);

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
          <Typography variant="h4" gutterBottom>
            Kanban Tabla
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              select
              value={selectedBoard || ''}
              onChange={(e: any) => handleBoardChange(e)}
              label="Izaberi tablu"
            >
              {/* Add a "Clear Selection" option */}
              <MenuItem key="clear" value="" onSelect={() => setSelectedBoard(null)}>
                Očisti izbor
              </MenuItem>
              {
                boards && boards.length === 0 ? (
                  <MenuItem key="empty" value="">
                    Trenutno nemamo nijednu tablu
                  </MenuItem>
                ) :
                  boards.map((board: Board) => (
                    <MenuItem key={board._id} value={board._id}>
                      {board.title}
                    </MenuItem>
                  ))}
            </TextField>
          </FormControl>
        </Box>
        <Divider sx={{ borderBottomWidth: '2px', borderColor: indigo.dark }} />
        {
          selectedBoard && (
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
                  <ColumnAdd onAdd={handleColumnAdd} />
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

  return {
    props: {
      boards: boards || [],
    },
  };
};
