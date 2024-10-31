export interface Contact {
  _id: string;
  avatar: string;
  lastActivity?: number;
  name: string;
  isActive: boolean;
  email?: string;
}

interface Attachment {
  _id: string;
  url: string;
}

export interface Message {
  id: string;
  attachments: Attachment[];
  body: string;
  contentType: string;
  createdAt: number;
  authorId: string;
}

export interface Thread {
  _id?: string;
  messages: Message[];
  participantIds: string[];
  participants?: Contact[];
  type: 'ONE_TO_ONE' | 'GROUP';
  unreadCount?: number;
}
