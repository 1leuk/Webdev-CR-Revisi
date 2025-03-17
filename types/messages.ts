// Additional types for chat functionality
import { User } from "./types";

export type Message = {
  id: string;
  content: string;
  createdAt: string; // ISO date string
  senderId: string;
  sender?: User;
  receiverId?: string | null;
  receiver?: User | null;
  conversationId: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  topic: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  messages?: Message[];
  users: User[];
  userIds: string[];
  // Helper properties for UI
  lastMessage?: Message;
  unreadCount?: number;
};
