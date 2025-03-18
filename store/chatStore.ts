import { create } from "zustand";
import { Message, Conversation } from "@/types/messages";
import { User } from "@/types/types";
import { toast } from "react-hot-toast";

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  searchResults: User[];
  isLoading: boolean;

  // API Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    receiverId?: string
  ) => Promise<void>;
  createConversation: (
    topic: string,
    userIds: string[],
    initialMessage?: string
  ) => Promise<string | null>;
  markAsRead: (messageIds?: string[], conversationId?: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;

  // UI Actions
  setCurrentConversation: (conversation: Conversation | null) => void;
  resetState: () => void;
  
  // Additional methods needed by chat page
  addMessageToConversation: (message: Message) => void;
  addConversation: (conversation: Conversation) => void;
}

const defaultState = {
  conversations: [],
  currentConversation: null,
  searchResults: [],
  isLoading: false,
};

const useChatStore = create<ChatStore>((set, get) => ({
  ...defaultState,

  // Fetch all conversations for the current user
  fetchConversations: async () => {
    try {
      set({ isLoading: true });

      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const conversations = await response.json();
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
      set({ isLoading: false });
    }
  },

  // Fetch a specific conversation with messages
  fetchConversation: async (id: string) => {
    try {
      set({ isLoading: true });

      const response = await fetch(`/api/conversations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const conversation = await response.json();
      set({ currentConversation: conversation, isLoading: false });

      // Also update this conversation in the conversations list
      const { conversations } = get();
      const updatedConversations = conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      );

      set({ conversations: updatedConversations });
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      toast.error("Failed to load conversation");
      set({ isLoading: false });
    }
  },

  // Send a message in a conversation
  sendMessage: async (
    conversationId: string,
    content: string,
    receiverId?: string
  ) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, receiverId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();

      // Update the current conversation with the new message
      const { currentConversation } = get();
      if (currentConversation && currentConversation.id === conversationId) {
        set({
          currentConversation: {
            ...currentConversation,
            messages: [...(currentConversation.messages || []), newMessage],
          },
        });
      }

      // Update the conversations list with the last message
      const { conversations } = get();
      const updatedConversations = conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      // Sort conversations by updatedAt
      const sortedConversations = [...updatedConversations].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      set({ conversations: sortedConversations });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  },

  // Create a new conversation
  createConversation: async (
    topic: string,
    userIds: string[],
    initialMessage?: string
  ) => {
    try {
      set({ isLoading: true });

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, userIds, initialMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();

      // Update conversations list
      await get().fetchConversations();

      set({ isLoading: false });
      return newConversation.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
      set({ isLoading: false });
      return null;
    }
  },

  // Mark messages as read
  markAsRead: async (messageIds?: string[], conversationId?: string) => {
    try {
      if (!messageIds && !conversationId) return;

      const response = await fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds, conversationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      // Update unread count in conversations list
      if (conversationId) {
        const { conversations } = get();
        const updatedConversations = conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        );

        set({ conversations: updatedConversations });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      // Don't show toast for this error as it's not critical
    }
  },

  // Search for users to start a conversation with
  searchUsers: async (query: string) => {
    try {
      if (!query || query.length < 2) {
        set({ searchResults: [] });
        return;
      }

      const response = await fetch(
        `/api/users?search=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const users = await response.json();
      set({ searchResults: users });
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    }
  },

  // UI Actions
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
  },

  resetState: () => {
    set(defaultState);
  },
  
  // Additional methods for chat page
  addMessageToConversation: (message: Message) => {
    const { currentConversation, conversations } = get();
    
    // Add to current conversation if it matches
    if (currentConversation && message.conversationId === currentConversation.id) {
      set({
        currentConversation: {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), message],
        },
      });
    }
    
    // Update the last message in conversations list
    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === message.conversationId) {
        return {
          ...conversation,
          lastMessage: message,
          unreadCount: (conversation.unreadCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return conversation;
    });
    
    // Sort by most recent message
    const sortedConversations = [...updatedConversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    set({ conversations: sortedConversations });
  },
  
  addConversation: (conversation: Conversation) => {
    const { conversations } = get();
    
    // Check if conversation already exists
    const exists = conversations.some((c) => c.id === conversation.id);
    
    if (!exists) {
      // Add to beginning of list as it's the newest
      set({
        conversations: [conversation, ...conversations],
      });
      
      toast.success("New conversation started");
    }
  },
}));

export default useChatStore;