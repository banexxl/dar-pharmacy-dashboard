import { ObjectId } from "mongodb";

export interface Attachment {
  _id?: string;
  uploadedDateTime: Date;
  type: 'image' | 'file';
  url: string;
}

export interface CheckItem {
  _id?: string;
  name: string;
  state: 'incomplete' | 'complete';
}

export interface Checklist {
  _id?: string;
  checkItems: CheckItem[];
  name: string;
}

export interface Comment {
  _id?: string;
  authorId: string;
  createdAt: Date;
  message: string;
}

export interface Task {
  _id?: string;
  createdBy: Member;
  assignedTo: Member[];
  attachments: Attachment[];
  checklists: Checklist[];
  columnId: string;
  comments: Comment[];
  description: string | null;
  due: Date | null;
  isSubscribed: boolean;
  labels: string[];
  name: string;
}


export interface Column {
  _id?: string;
  boardId?: string;
  taskIds?: string[];
  name: string;
}

export interface Member {
  _id?: string;
  avatar: string | null;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export interface Board {
  _id?: string;
  title: string
  members: Member[];
  columns: Column[];
  tasks: Task[];
}


export type GetBoardRequest = object;

export type GetBoardResponse = Promise<Board>;

export type CreateColumnRequest = {
  name: string;
};

export type CreateColumnResponse = Promise<Column>;

export type UpdateColumnRequest = {
  columnId: string;
  update: {
    name: string;
  };
};

export type UpdateColumnResponse = Promise<Column>;

export type ClearColumnRequest = {
  columnId: string;
};

export type ClearColumnResponse = Promise<true>;

export type DeleteColumnRequest = {
  columnId: string;
};

export type DeleteColumnResponse = Promise<true>;

export type CreateTaskRequest = {
  columnId: string;
  name: string;
};

export type CreateTaskResponse = Promise<Task>;

export type UpdateTaskRequest = {
  taskId: string;
  update: {
    name?: string;
    description?: string;
    isSubscribed?: boolean;
    labels?: string[];
  };
};

export type UpdateTaskResponse = Promise<Task>;

export type MoveTaskRequest = {
  taskId: string;
  position: number;
  columnId?: string;
};

export type MoveTaskResponse = Promise<true>;

export type DeleteTaskRequest = {
  taskId: string;
};

export type DeleteTaskResponse = Promise<true>;

export type AddCommentRequest = {
  taskId: string;
  message: string;
};

export type AddCommentResponse = Promise<Comment>;

export type AddChecklistRequest = {
  taskId: string;
  name: string;
};

export type AddChecklistResponse = Promise<Checklist>;

export type UpdateChecklistRequest = {
  taskId: string;
  checklistId: string;
  update: {
    name: string;
  };
};

export type UpdateChecklistResponse = Promise<Checklist>;

export type DeleteChecklistRequest = {
  taskId: string;
  checklistId: string;
};

export type DeleteChecklistResponse = Promise<true>;

export type AddCheckItemRequest = {
  taskId: string;
  checklistId: string;
  name: string;
};

export type AddCheckItemResponse = Promise<CheckItem>;

export type UpdateCheckItemRequest = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
  update: {
    name?: string;
    state?: 'complete' | 'incomplete';
  };
};

export type UpdateCheckItemResponse = Promise<CheckItem>;

export type DeleteCheckItemRequest = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
};

export type DeleteCheckItemResponse = Promise<true>;

