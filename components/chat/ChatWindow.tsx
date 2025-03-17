"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Conversation, Message } from "@/types/messages";
import useChatStore from "@/store/chatStore";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/button";
import { FiSend, FiInfo } from "react-icons/fi";

interface ChatWindowProps {
  conversation: Conversation;
}

export default function ChatWindow({ conversation }: ChatWindowProps) {
  const { data: session } = useSession();
  const { sendMessage } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine recipient user for direct messaging
  const otherUser = conversation.users?.find(
    (user) => user.id !== session?.user?.id
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    await sendMessage(
      conversation.id,
      newMessage,
      otherUser?.id // Send to the other user in the conversation
    );

    setNewMessage("");
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[] = []) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const messageGroups = groupMessagesByDate(conversation.messages);

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
            {otherUser?.image ? (
              <Image
                src={otherUser.image}
                alt={otherUser.name || "User"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {otherUser?.name?.[0] || conversation.topic[0]}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {conversation.topic.startsWith("Support:")
                ? conversation.topic
                : otherUser?.name || conversation.topic}
            </h2>
            <p className="text-sm text-gray-400">
              {conversation.topic.startsWith("Support:")
                ? "Customer Support"
                : otherUser?.email ||
                  `${conversation.users?.length || 0} participants`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageGroups.map(({ date, messages }, groupIndex) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                {new Date(date).toDateString() === new Date().toDateString()
                  ? "Today"
                  : format(new Date(date), "MMMM d, yyyy")}
              </span>
            </div>

            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === session?.user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="font-semibold text-sm text-gray-300 mb-1">
                        {message.sender?.name || "Unknown User"}
                      </div>
                    )}
                    <div className="text-sm break-words">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {format(new Date(message.createdAt), "h:mm a")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {conversation.messages?.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FiInfo className="text-3xl mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <FiSend />
          </Button>
        </form>
      </div>
    </div>
  );
}
