"use client";

import { useRouter } from "next/navigation";
import { Conversation } from "@/types/messages";
import useChatStore from "@/store/chatStore";
import { formatDistanceToNow } from "date-fns";
import { FiCircle } from "react-icons/fi";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
}: ChatSidebarProps) {
  const router = useRouter();
  const { fetchConversation } = useChatStore();

  const handleSelectConversation = (id: string) => {
    fetchConversation(id);
    router.push(`/chat?id=${id}`, { scroll: false });
  };

  return (
    <div className="h-full">
      {conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <p>No conversations yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {conversations.map((conversation) => {
            // Get the other user in the conversation (for direct chats)
            const otherUser = conversation.users?.find(
              (u) => !conversation.topic.startsWith("Support:")
            );

            // Determine if this is a support conversation
            const isSupport = conversation.topic.startsWith("Support:");

            // Format the conversation preview title
            const title = isSupport
              ? conversation.topic
              : otherUser?.name || conversation.topic;

            return (
              <li
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors
                  ${currentConversationId === conversation.id ? "bg-gray-800" : ""}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="text-md font-medium text-gray-200 truncate mr-2">
                        {title}
                      </h3>
                      {conversation.unreadCount &&
                      conversation.unreadCount > 0 ? (
                        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(
                        new Date(conversation.lastMessage.createdAt),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center mt-2 text-xs text-gray-500">
                  {isSupport ? (
                    <span className="flex items-center">
                      <FiCircle className="text-green-500 mr-1" size={8} />
                      Support Chat
                    </span>
                  ) : (
                    <span>{conversation.users?.length} participants</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
