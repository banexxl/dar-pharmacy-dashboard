import { pushAlert } from '@/components/push-notifications';
import { getSession } from 'next-auth/react';
import { slice } from 'src/slices/kanban';
import type { AppThunk } from 'src/store';
import sweetalert2 from 'sweetalert2';


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

type CreateColumnParams = {
  id: string;
  taskIds: string[];
  name: string;
  boardId: string;
};

export const createColumn = (params: CreateColumnParams): AppThunk => async (dispatch): Promise<void> => {

  try {
    const response = await fetch(`/api/kanban/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create column');
    } else {
      dispatch(slice.actions.createColumn({ ...params }));
      sweetalert2.fire({
        icon: 'success',
        title: 'Uspešno dodata kolona',
        allowEscapeKey: true,
        allowOutsideClick: true,
      });
    }
  } catch (error) {
    console.error('Error while creating column:', error);
  }
};

type UpdateColumnParams = {
  columnId: string;
  boardId: string
  name: string;
  taskIds: string[];
};

const updateColumn = (params: UpdateColumnParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`/api/kanban/columns/${params.columnId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      sweetalert2.fire({
        icon: 'error',
        title: 'Failed to update column',
        allowEscapeKey: true,
        allowOutsideClick: true,
      })
    }
    dispatch(slice.actions.updateColumn({
      id: params.columnId,
      boardId: params.boardId,
      name: params.name,
      taskIds: params.taskIds
    }));
    sweetalert2.fire({
      icon: 'success',
      title: 'Uspešno ažurirana kolona',
      allowEscapeKey: true,
      allowOutsideClick: true,
    })
  };

type ClearColumnParams = {
  columnId: string;
};

const clearColumn =
  (params: ClearColumnParams): AppThunk =>
    async (dispatch: any): Promise<void> => {
      await fetch(`api/kanban/columns/${params.columnId}/clear`, {
        method: 'POST',
      });

      dispatch(slice.actions.clearColumn(params.columnId));
    };

type DeleteColumnParams = {
  columnId: string;
};

const deleteColumn = (params: DeleteColumnParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    await fetch(`api/kanban/columns/${params.columnId}`, {
      method: 'DELETE',
    });

    dispatch(slice.actions.deleteColumn(params.columnId));
  };

type CreateTaskParams = {
  columnId: string;
  name: string;
};

const createTask = (params: CreateTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    try {
      // Fetch the session to get the authenticated user
      const session = await getSession();

      if (!session) {
        throw new Error('User not authenticated');
      }

      // Add userId to the task request body
      const requestBody = {
        columnId: params.columnId,
        name: params.name,
        userId: session.user?.name, // Authenticated user's ID from NextAuth session
      };

      const response = await fetch(`/api/kanban/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();

      // Dispatch the createTask action to update Redux store
      dispatch(slice.actions.createTask(data));

      // Show success alert
      sweetalert2.fire({
        icon: 'success',
        title: 'Task successfully created',
        allowEscapeKey: true,
        allowOutsideClick: true,
      });
    } catch (error: any) {
      console.error('Error while creating task:', error);
      sweetalert2.fire({
        icon: 'error',
        title: 'Failed to create task',
        text: error.toString(),
      });
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
    const response = await fetch(`api/kanban/tasks/${params.taskId}`, {
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
    await fetch(`api/kanban/tasks/${params.taskId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    dispatch(slice.actions.moveTask(params));
  };

type DeleteTaskParams = {
  taskId: string;
};

const deleteTask = (params: DeleteTaskParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    await fetch(`api/kanban/tasks/${params.taskId}`, {
      method: 'DELETE',
    });

    dispatch(slice.actions.deleteTask(params.taskId));
  };

type AddCommentParams = {
  taskId: string;
  message: string;
};

const addComment = (params: AddCommentParams): AppThunk =>
  async (dispatch: any): Promise<void> => {
    const response = await fetch(`api/kanban/comments`, {
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
    const response = await fetch(`api/kanban/checklists`, {
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
    const response = await fetch(`api/kanban/checklists/${params.checklistId}`, {
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
    await fetch(`api/kanban/checklists/${params.checklistId}`, {
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
    const response = await fetch(`api/kanban/checkitems`, {
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
    const response = await fetch(`api/kanban/checkitems/${params.checkItemId}`, {
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
    await fetch(`api/kanban/checkitems/${params.checkItemId}`, {
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
