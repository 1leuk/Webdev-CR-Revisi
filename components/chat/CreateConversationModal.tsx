"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useChatStore from "@/store/chatStore";
import { User } from "@/types/types";
import { Button } from "@/components/button";
import { FiSearch, FiX, FiUser, FiHeadphones } from "react-icons/fi";

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateConversationModal({
  isOpen,
  onClose,
}: CreateConversationModalProps) {
  const router = useRouter();
  const { searchUsers, searchResults, createConversation } = useChatStore();

  const [topic, setTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreatingSupport, setIsCreatingSupport] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTopic("");
      setSearchQuery("");
      setMessage("");
      setSelectedUsers([]);
      setIsCreatingSupport(false);
    }
  }, [isOpen]);

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery);
    }
  }, [searchQuery, searchUsers]);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.some((selected) => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleCreateSupportChat = async () => {
    setIsCreatingSupport(true);
    setTopic("Support: " + (topic || "General Inquiry"));
  };

  const handleCreateConversation = async () => {
    if (!topic) {
      // Default topic if none provided
      setTopic(
        selectedUsers.map((u) => u.name).join(", ") || "New Conversation"
      );
      return;
    }

    if (selectedUsers.length === 0 && !isCreatingSupport) {
      alert("Please select at least one user");
      return;
    }

    // Create the conversation
    const conversationId = await createConversation(
      topic,
      selectedUsers.map((u) => u.id),
      message
    );

    if (conversationId) {
      router.push(`/chat?id=${conversationId}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-200">
            {isCreatingSupport ? "Contact Support" : "New Conversation"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-gray-300 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter conversation topic"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {!isCreatingSupport && (
            <>
              {/* User Search */}
              <div>
                <label className="block text-gray-300 mb-1">
                  Add Participants
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Search Results */}
                {searchQuery.length >= 2 && searchResults.length > 0 && (
                  <div className="mt-2 bg-gray-700 rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="p-2 hover:bg-gray-600 cursor-pointer flex items-center"
                      >
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-2">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || "User"}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <FiUser />
                          )}
                        </div>
                        <div>
                          <div className="text-gray-200">
                            {user.name || "Unnamed User"}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="mt-2 p-2 bg-gray-700 rounded-md text-gray-400 text-sm">
                    No users found
                  </div>
                )}

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-gray-700 rounded-full px-3 py-1 flex items-center"
                      >
                        <span className="text-gray-200 text-sm mr-2">
                          {user.name || user.email}
                        </span>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Initial Message */}
          <div>
            <label className="block text-gray-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your first message"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-24"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {!isCreatingSupport && (
              <Button
                type="button"
                onClick={handleCreateSupportChat}
                className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
              >
                <FiHeadphones className="mr-2" />
                Contact Support
              </Button>
            )}

            <Button
              type="button"
              onClick={handleCreateConversation}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              disabled={!message.trim()}
            >
              {isCreatingSupport ? "Send to Support" : "Create Chat"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
