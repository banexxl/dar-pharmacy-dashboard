import { Session } from "next-auth";

export interface Contact {
  name: string;
  email: string;
  avatar: string;
  role: string;
  _id: string;
  lastActivity: number;
  isActive: boolean;
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
  createdAt: string;
  authorId: string;
}

export interface Thread {
  _id?: string;
  messages: Message[];
  participantIds: string[];
  participants: Contact[];
  type: 'ONE_TO_ONE' | 'GROUP';
  unreadCount?: number;
  participantsReadMessage?: string[];
}

// Extend the default Session type
export interface CustomSession extends Session {
  data: {
    user: {
      // Include the default properties from the original Session user type
      name: string
      email: string
      avatar: string
      role: string;
      _id: string;
      lastActivity: number;
      isActive: boolean;
    };
  }
}
