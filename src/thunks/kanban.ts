import { slice } from 'src/slices/kanban';
import type { AppThunk } from 'src/store';

const API_BASE_URL = '/api'; // Base URL for API calls

type GetBoardParams = {
  boardId: string;
}

const getBoard = (boardId: string): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}`);
    const data = await response.json();

    dispatch(slice.actions.getBoard(data._id));
  };

type CreateColumnParams = {
  name: string;
};

const createColumn =
  (params: CreateColumnParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      dispatch(slice.actions.createColumn(data));
    };

type UpdateColumnParams = {
  columnId: string;
  update: {
    name: string;
  };
};

const updateColumn =
  (params: UpdateColumnParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/columns/${params.columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.update),
      });
      const data = await response.json();

      dispatch(slice.actions.updateColumn(data));
    };

type ClearColumnParams = {
  columnId: string;
};

const clearColumn =
  (params: ClearColumnParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/columns/${params.columnId}/clear`, {
        method: 'POST',
      });

      dispatch(slice.actions.clearColumn(params.columnId));
    };

type DeleteColumnParams = {
  columnId: string;
};

const deleteColumn =
  (params: DeleteColumnParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/columns/${params.columnId}`, {
        method: 'DELETE',
      });

      dispatch(slice.actions.deleteColumn(params.columnId));
    };

type CreateTaskParams = {
  columnId: string;
  name: string;
};

const createTask =
  (params: CreateTaskParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      dispatch(slice.actions.createTask(data));
    };

type UpdateTaskParams = {
  taskId: string;
  update: {
    name?: string;
    description?: string;
    isSubscribed?: boolean;
    labels?: string[];
  };
};

const updateTask =
  (params: UpdateTaskParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${params.taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.update),
      });
      const data = await response.json();

      dispatch(slice.actions.updateTask(data));
    };

type MoveTaskParams = {
  taskId: string;
  position: number;
  columnId?: string;
};

const moveTask =
  (params: MoveTaskParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/tasks/${params.taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      dispatch(slice.actions.moveTask(params));
    };

type DeleteTaskParams = {
  taskId: string;
};

const deleteTask =
  (params: DeleteTaskParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/tasks/${params.taskId}`, {
        method: 'DELETE',
      });

      dispatch(slice.actions.deleteTask(params.taskId));
    };

type AddCommentParams = {
  taskId: string;
  message: string;
};

const addComment =
  (params: AddCommentParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      dispatch(
        slice.actions.addComment({
          taskId: params.taskId,
          comment: data,
        })
      );
    };

type AddCheckListParams = {
  taskId: string;
  name: string;
};

const addChecklist =
  (params: AddCheckListParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      dispatch(
        slice.actions.addChecklist({
          taskId: params.taskId,
          checklist: data,
        })
      );
    };

type UpdateChecklistParams = {
  taskId: string;
  checklistId: string;
  update: { name: string };
};

const updateChecklist =
  (params: UpdateChecklistParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/checklists/${params.checklistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.update),
      });
      const data = await response.json();

      dispatch(
        slice.actions.updateChecklist({
          taskId: params.taskId,
          checklist: data,
        })
      );
    };

type DeleteChecklistParams = {
  taskId: string;
  checklistId: string;
};

const deleteChecklist =
  (params: DeleteChecklistParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/checklists/${params.checklistId}`, {
        method: 'DELETE',
      });

      dispatch(slice.actions.deleteChecklist(params));
    };

type AddCheckItemParams = {
  taskId: string;
  checklistId: string;
  name: string;
};

const addCheckItem =
  (params: AddCheckItemParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/checkitems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();

      dispatch(
        slice.actions.addCheckItem({
          taskId: params.taskId,
          checklistId: params.checklistId,
          checkItem: data,
        })
      );
    };

type UpdateCheckItemParams = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
  update: {
    name?: string;
    state?: 'complete' | 'incomplete';
  };
};

const updateCheckItem =
  (params: UpdateCheckItemParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/checkitems/${params.checkItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.update),
      });
      const data = await response.json();

      dispatch(
        slice.actions.updateCheckItem({
          taskId: params.taskId,
          checklistId: params.checklistId,
          checkItem: data,
        })
      );
    };

type DeleteCheckItemParams = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
};

const deleteCheckItem =
  (params: DeleteCheckItemParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`${API_BASE_URL}/checkitems/${params.checkItemId}`, {
        method: 'DELETE',
      });

      dispatch(slice.actions.deleteCheckItem(params));
    };

export const thunks = {
  addCheckItem,
  addChecklist,
  addComment,
  clearColumn,
  createColumn,
  createTask,
  deleteCheckItem,
  deleteChecklist,
  deleteColumn,
  deleteTask,
  getBoard,
  moveTask,
  updateCheckItem,
  updateChecklist,
  updateColumn,
  updateTask,
};
