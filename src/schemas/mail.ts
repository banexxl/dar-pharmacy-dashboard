export interface Attachment {
  id: string;
  name?: string;
  size?: string;
  type: 'file' | 'image';
  url?: string;
}

export interface Email {
  id: string;
  attachments?: Attachment[];
  date: number;
  folder: string;
  from: string;
  isImportant: boolean;
  isStarred: boolean;
  isUnread: boolean;
  labelIds: string[];
  text: string;
  subject: string;
  to: string;
}

export type LabelType = 'system' | 'custom';

export interface Label {
  id: string;
  color?: string;
  name: string;
  totalCount?: number;
  type: LabelType;
  unreadCount?: number;
}
