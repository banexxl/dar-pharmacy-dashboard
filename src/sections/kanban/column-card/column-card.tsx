import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from 'src/schemas/kanban';

import { TaskAdd } from '../task-add';
import { TaskCard } from '../task-card';
import { ColumnHeader } from './column-header';
import { useAppSelector } from '@/store/hooks';

const useColumn = (columnId: string): Column | undefined => {
  return useAppSelector((state) => {
    const { columns } = state.kanban;
    return columns.byId[columnId];
  });
};

interface ColumnCardProps {
  columnId: string;
  onClear?: () => void;
  onDelete?: () => void;
  onRename?: (name: string) => void;
  onTaskAdd?: (name?: string) => void;
  onTaskOpen?: (taskId: string) => void;
}

type DragItemData = {
  type: 'task' | 'column';
  columnId: string;
  index?: number;
};

interface SortableTaskCardProps {
  columnId: string;
  taskId: string;
  index: number;
  onTaskOpen?: (taskId: string) => void;
}

const SortableTaskCard: FC<SortableTaskCardProps> = ({ columnId, taskId, index, onTaskOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskId,
    data: { type: 'task', columnId, index } satisfies DragItemData,
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        outline: 'none',
        py: 1.5,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        key={taskId}
        dragging={isDragging}
        onOpen={() => onTaskOpen?.(taskId)}
        taskId={taskId}
      />
    </Box>
  );
};

export const ColumnCard: FC<ColumnCardProps> = (props) => {
  const { columnId, onTaskAdd, onTaskOpen, onClear, onDelete, onRename, ...other } = props;
  const column = useColumn(columnId);
  const { setNodeRef } = useDroppable({
    id: column?._id?.toString() ?? columnId,
    data: { type: 'column', columnId } satisfies DragItemData,
  });

  if (!column) {
    return null;
  }

  const tasksCount = column.taskIds?.length;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        overflowX: 'auto',
        overflowY: 'auto',
        width: {
          xs: 300,
          sm: 380,
        },
      }}
      {...other}
    >
      <ColumnHeader
        name={column.name}
        onClear={onClear}
        onDelete={onDelete}
        onRename={onRename}
        tasksCount={tasksCount || 0}
      />
      <Box
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'neutral.900' : 'neutral.100',
          borderRadius: 2.5,
        }}
      >
        <SortableContext
          id={columnId}
          items={column.taskIds || []}
          strategy={verticalListSortingStrategy}
        >
          <Box
            ref={setNodeRef}
            sx={{
              flexGrow: 1,
              minHeight: 80,
              overflowY: 'auto',
              px: 3,
              pt: 1.5,
            }}
          >
            {
              column?.taskIds &&
              column?.taskIds.map((task: string, index: number) => (
                <SortableTaskCard
                  key={task}
                  columnId={columnId}
                  index={index}
                  onTaskOpen={onTaskOpen}
                  taskId={task}
                />
              ))}
          </Box>
        </SortableContext>
        <Box
          sx={{
            pt: 1.5,
            pb: 3,
            px: 3,
          }}
        >
          <TaskAdd onAdd={onTaskAdd} />
        </Box>
      </Box>
    </Box>
  );
};

ColumnCard.propTypes = {
  columnId: PropTypes.string.isRequired,
  onClear: PropTypes.func,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  onTaskAdd: PropTypes.func,
  onTaskOpen: PropTypes.func,
};
