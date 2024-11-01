import { Session } from "next-auth";

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

// Extend the default Session type
export interface CustomSession extends Session {
  data: {
    user: {
      // Include the default properties from the original Session user type
      name?: string | null;
      email?: string | null;
      avatar?: string | null;
      // Add your custom properties
      role: string;
      _id: string;
    };
  }
}
