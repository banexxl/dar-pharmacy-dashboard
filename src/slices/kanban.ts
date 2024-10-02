import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Board, CheckItem, Checklist, Column, Comment, Member, Task } from 'src/schemas/kanban';
import { objFromArray } from 'src/utils/obj-from-array';

interface KanbanState {
  isLoaded: boolean;
  columns: {
    byId: Record<string, Column>;
    allIds: string[];
  };
  tasks: {
    byId: Record<string, Task>;
    allIds: string[];
  };
  members: {
    byId: Record<string, Member>;
    allIds: string[];
    byEmail: Record<string, Member>;
  };
}

type AddBoardAction = PayloadAction<Board>;

type GetBoardAction = PayloadAction<Board>;

type CreateColumnAction = PayloadAction<Column>;

type UpdateColumnAction = PayloadAction<Column>;

type ClearColumnAction = PayloadAction<{ boardId: string; columnId: string }>;

type DeleteColumnAction = PayloadAction<string>;

type CreateTaskAction = PayloadAction<Task>;

type UpdateTaskAction = PayloadAction<Task>;

type MoveTaskAction = PayloadAction<{ boardId: string, sourceColumnId: string, destinationColumnId: string, taskId: string; position: number }>;

type DeleteTaskAction = PayloadAction<string>;

type AddCommentAction = PayloadAction<{ boardId: string, taskId: string; comment: Comment }>;

// type AddChecklistAction = PayloadAction<{ boardId: string, taskId: string; checklist: Checklist }>;

type UpdateChecklistAction = PayloadAction<{ taskId: string; checklist: { name?: string, checkItems?: CheckItem[] } }>;

type DeleteChecklistAction = PayloadAction<{ taskId: string }>;

type AddCheckItemAction = PayloadAction<{ boardId: string, taskId: string; checkItem: CheckItem; }>;

type UpdateCheckItemAction = PayloadAction<{ boardId: string, taskId: string; checkItem: CheckItem; }>;

type DeleteCheckItemAction = PayloadAction<{ taskId: string; checkItemId: string; }>;

const initialState: KanbanState = {
  isLoaded: false,
  columns: {
    byId: {},
    allIds: [],
  },
  tasks: {
    byId: {},
    allIds: [],
  },
  members: {
    byId: {},
    allIds: [],
    byEmail: {}
  },
};

const reducers = {
  addBoard(state: KanbanState, action: AddBoardAction): void {
    const board = action.payload; // Assuming payload contains the full board data
    state.columns.byId = objFromArray(board.columns);
    state.columns.allIds = Object.keys(state.columns.byId);
    state.members.byId = objFromArray(board.members);
    state.members.allIds = Object.keys(state.members.byId);
    state.isLoaded = true;
  },
  deleteBoard(state: KanbanState): void {
    state.columns.byId = {};
    state.columns.allIds = [];
    state.tasks.byId = {};
    state.tasks.allIds = [];
    state.members.byId = {};
    state.members.allIds = [];
    state.isLoaded = false
  },
  getBoard(state: KanbanState, action: GetBoardAction): void {
    const board = action.payload;

    state.columns.byId = objFromArray(board.columns ? board.columns : []);
    state.columns.allIds = Object.keys(state.columns.byId);
    state.tasks.byId = objFromArray(board.tasks ? board.tasks : []);
    state.tasks.allIds = Object.keys(state.tasks.byId);
    state.members.byId = objFromArray(board.members);
    state.members.allIds = Object.keys(state.members.byId);
    state.members.byEmail = objFromArray(board.members);
    state.isLoaded = true;
  },
  createColumn(state: KanbanState, action: CreateColumnAction): void {
    const column = action.payload;

    // Immutably update the state
    state.columns.byId = {
      ...state.columns.byId,
      [column._id!]: column,
    };

    // Ensure the new state reference is created for allIds
    state.columns.allIds = [...state.columns.allIds, column._id!];
  },
  deleteColumn(state: KanbanState, action: DeleteColumnAction): void {
    const columnId = action.payload;

    // Delete the column by creating a new reference to state.columns.byId
    const { [columnId]: deletedColumn, ...remainingColumns } = state.columns.byId;
    state.columns.byId = remainingColumns;

    // Update allIds immutably
    state.columns.allIds = state.columns.allIds.filter((id) => id !== columnId);
  },
  renameColumn(state: KanbanState, action: UpdateColumnAction): void {
    const updatedColumn = action.payload;

    // Only update the column name while preserving other fields like taskIds
    state.columns.byId[updatedColumn._id!].name = updatedColumn.name;
  },
  clearColumn(state: KanbanState, action: ClearColumnAction): void {
    const { boardId, columnId } = action.payload;

    // taskIds to be removed
    const { taskIds } = state.columns.byId[columnId];

    // Delete the taskIds references from the column
    state.columns.byId[columnId].taskIds = [];

    // Delete the tasks from state
    taskIds!.forEach((taskId) => {
      delete state.tasks.byId[taskId];
    });

    state.tasks.allIds = state.tasks.allIds.filter((taskId) => taskIds!.includes(taskId));
  },
  createTask(state: KanbanState, action: CreateTaskAction): void {
    const task = action.payload;

    state.tasks.byId[task._id!] = task;
    state.tasks.allIds.push(task._id!);

    // Add task to the column
    state.columns.byId[task.columnId].taskIds!.push(task._id!);
  },
  updateTask(state: KanbanState, action: UpdateTaskAction): void {
    const task = action.payload;
    Object.assign(state.tasks.byId[task._id!.toString()], task);
  },
  moveTask(state: KanbanState, action: MoveTaskAction): void {
    const { taskId, sourceColumnId, destinationColumnId, position, boardId } = action.payload;

    // Remove task from the source column
    state.columns.byId[sourceColumnId].taskIds = state.columns.byId[sourceColumnId].taskIds!.filter(
      (_taskId) => _taskId !== taskId
    );

    // Add task to the destination column at the specified position
    state.tasks.byId[taskId].columnId = destinationColumnId; // Update the task's column reference
    state.columns.byId[destinationColumnId].taskIds!.splice(position, 0, taskId);
  },
  deleteTask(state: KanbanState, action: DeleteTaskAction): void {
    const taskId = action.payload;
    const { columnId } = state.tasks.byId[taskId];

    delete state.tasks.byId[taskId];
    state.tasks.allIds = state.tasks.allIds.filter((_taskId) => _taskId !== taskId);
    state.columns.byId[columnId].taskIds = state.columns.byId[columnId].taskIds!.filter(
      (_taskId) => _taskId !== taskId
    );
  },
  addComment(state: KanbanState, action: AddCommentAction): void {
    const { boardId, taskId, comment } = action.payload;

    // Deserialize `createdAt` to a Date object
    comment.createdAt = new Date(comment.createdAt);

    // Assuming you are storing comments in tasks
    const task = state.tasks.byId[taskId];
    task.comments.push(comment);
  },
  // // Add Checklist
  // addChecklist(state: KanbanState, action: AddChecklistAction): void {
  //   const { taskId, checklist } = action.payload;
  //   const task = state.tasks.byId[taskId];

  //   // If the task already has a checklist, prevent adding another one
  //   if (task.checklist && task.checklist._id) {
  //     console.error('A checklist already exists for this task.');
  //     return;
  //   }

  //   // Update the task's checklist fields directly
  //   task.checklist = {
  //     ...task.checklist,
  //     _id: checklist._id,
  //     name: checklist.name,
  //     checkItems: checklist.checkItems,
  //   };
  // },

  // Update Checklist
  updateChecklist(state: KanbanState, action: UpdateChecklistAction): void {
    const { taskId, checklist } = action.payload;
    const task = state.tasks.byId[taskId];

    // Update the checklist name if provided
    if (checklist.name) {
      task.checklist.name = checklist.name;
    }

    // Update the checkItems if provided
    if (checklist.checkItems) {
      task.checklist.checkItems = checklist.checkItems;
    }
  },

  // Delete Checklist
  deleteChecklist(state: KanbanState, action: DeleteChecklistAction): void {
    const { taskId } = action.payload;
    const task = state.tasks.byId[taskId];

    task.checklist = { _id: task._id, name: '', checkItems: [] }; // Reset the checklist to an empty state

  },

  // Add Check Item
  addCheckItem(state: KanbanState, action: AddCheckItemAction): void {
    const { taskId, checkItem } = action.payload;
    const task = state.tasks.byId[taskId];
    const checklist = task.checklist;
    checklist.checkItems.push(checkItem);
  },

  // Update Check Item
  updateCheckItem(state: KanbanState, action: UpdateCheckItemAction): void {
    const { taskId, checkItem } = action.payload;
    const task = state.tasks.byId[taskId];
    const checklist = task.checklist;

    // Ensure we're working with the correct checklist and update the check item

    checklist.checkItems = checklist.checkItems.map((_checkItem) =>
      _checkItem._id === checkItem._id ? checkItem : _checkItem
    );

  },

  // Delete Check Item
  deleteCheckItem(state: KanbanState, action: DeleteCheckItemAction): void {
    const { taskId, checkItemId } = action.payload;
    const task = state.tasks.byId[taskId];
    const checklist = task.checklist;

    checklist.checkItems = checklist.checkItems.filter(
      (checkItem) => checkItem._id !== checkItemId
    );
  },
}
export const slice = createSlice({
  name: 'kanban',
  initialState,
  reducers,
});

export const { reducer } = slice;
