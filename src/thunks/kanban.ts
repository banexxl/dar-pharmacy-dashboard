import toast from 'react-hot-toast';
import { slice } from 'src/slices/kanban';
import type { AppThunk } from 'src/store';


const getBoard = (boardId: string): AppThunk => async (dispatch): Promise<void> => {
  try {
    const response = await fetch(`/api/kanban/boards/${boardId}`, {
      method: 'GET',
    });
    const data = await response.json();
    dispatch(slice.actions.getBoard(data)); // Dispatch the entire board object, not just the boardId
  } catch (error) {
    console.error('Failed to fetch board:', error);
  }
};

const deleteBoard = (boardId: string): AppThunk => async (dispatch): Promise<void> => {
  try {
    const res = await fetch(`/api/kanban/boards/${boardId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      toast.error('Tablu nije moguće obrisati!');
    } else {
      dispatch(slice.actions.deleteBoard());
      toast.success('Tabla uspešno obrisana!');
    }

  } catch (error) {
    toast.error('Tablu nije moguće obrisati!');
  }
  dispatch(slice.actions.deleteBoard());
}

type CreateColumnParams = {
  _id?: string;
  taskIds: string[];
  name: string;
  boardId: string;
};

export const createColumn = (params: CreateColumnParams): AppThunk => async (dispatch): Promise<void> => {
  try {
    const response = await fetch(`/api/kanban/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params }),
    });
    const createColumnResponse = await response.json();

    if (createColumnResponse.boardUpdateResult.modifiedCount === 0) {
      toast.error('Neuspešno kreiranje kolone!');
    } else {
      if (createColumnResponse.boardUpdateResult.modifiedCount === 1) {
        await dispatch(slice.actions.createColumn(params));
        toast.success('Kolona uspešno kreirana!');
      }
    }
  } catch (error) {
    console.error('Error while creating column:', error);
  }
};

type DeleteColumnParams = {
  boardId: string;
  columnId: string;
};

const deleteColumn = (params: DeleteColumnParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const deleteResponse = await fetch(`/api/kanban/columns/${params.columnId}`, {
      method: 'DELETE',
      body: JSON.stringify({ boardId: params.boardId, columnId: params.columnId }),
    });

    if (!deleteResponse.ok) {
      toast.error('Neuspešno brisanje kolone!');
    } else {
      dispatch(slice.actions.deleteColumn(params.columnId));
      toast.success('Kolona uspešno obrisana!');
    }
  };

type UpdateColumnParams = {
  columnId: string;
  boardId: string
  name: string;
  taskIds?: string[];
};

const updateColumn = (params: UpdateColumnParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/columns/${params.columnId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      toast.error('Neuspešno ažuriranje kolone!');
    }
    dispatch(slice.actions.updateColumn({ _id: params.columnId, boardId: params.boardId, name: params.name, taskIds: params?.taskIds }));
    toast.success('Kolona uspešno ažurirana!');
  };

type ClearColumnParams = {
  boardId: string;
  columnId: string;
};

const clearColumn = (params: ClearColumnParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const clearColumnResponse = await fetch(`/api/kanban/columns/`, {
      method: 'DELETE',
      body: JSON.stringify({ boardId: params.boardId, columnId: params.columnId }),
    });
    if (!clearColumnResponse.ok) {
      toast.error('Neuspešno čišćenje kolone!');
    } else {
      dispatch(slice.actions.clearColumn({ boardId: params.boardId, columnId: params.columnId }));
      toast.success('Kolona uspešno očišćena!');
    }
  };

type CreateTaskParams = {
  boardId: string;
  columnId: string;
  name: string;
  createdBy: string;
};

const createTask = (params: CreateTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    try {
      // Add userId to the task request body
      const requestBody = {
        boardId: params.boardId,
        columnId: params.columnId,
        name: params.name,
        createdBy: params.createdBy, // Authenticated user's ID from NextAuth session
      };

      const response = await fetch(`/api/kanban/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        toast.error('Neuspešno kreiranje taska!');
      }
      const data = await response.json();
      // Dispatch the createTask action to update Redux store
      dispatch(slice.actions.createTask(data));

      // Show success alert
      toast.success('Task kreiran!');
    } catch (error: any) {
      console.error('Error while creating task:', error);
      toast.error('Neuspešno kreiranje taska!');
    }
  };

type DeleteTaskParams = {
  boardId: string;
  taskId: string;
};

const deleteTask = (params: DeleteTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const deleteTaskResponse = await fetch(`/api/kanban/tasks/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!deleteTaskResponse.ok) {
      toast.error('Neuspešno brisanje taska!');
    } else {
      try {
        dispatch(slice.actions.deleteTask(params.taskId));
        toast.success('Task uspešno obrisan!');
      } catch (error) {
        toast.error('Neuspešno brisanje taska!');
      }

    }
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

const updateTask = (params: UpdateTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/tasks/${params.taskId}`, {
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

const moveTask = (params: MoveTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    await fetch(`/api/kanban/tasks/${params.taskId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    dispatch(slice.actions.moveTask(params));
  };

type AddCommentParams = {
  taskId: string;
  message: string;
};

const addComment = (params: AddCommentParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/comments`, {
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

const addChecklist = (params: AddCheckListParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/checklists`, {
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

const updateChecklist = (params: UpdateChecklistParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/checklists/${params.checklistId}`, {
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

const deleteChecklist = (params: DeleteChecklistParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    await fetch(`/api/kanban/checklists/${params.checklistId}`, {
      method: 'DELETE',
    });

    dispatch(slice.actions.deleteChecklist(params));
  };

type AddCheckItemParams = {
  taskId: string;
  checklistId: string;
  name: string;
};

const addCheckItem = (params: AddCheckItemParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/checkitems`, {
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

const updateCheckItem = (params: UpdateCheckItemParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/checkitems/${params.checkItemId}`, {
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

const deleteCheckItem = (params: DeleteCheckItemParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    await fetch(`/api/kanban/checkitems/${params.checkItemId}`, {
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
  deleteBoard,
  moveTask,
  updateCheckItem,
  updateChecklist,
  updateColumn,
  updateTask,
};
