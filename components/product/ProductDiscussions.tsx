"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Discussion, Comment } from "@/types/discussions";
import { Button } from "@/components/button";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { 
  FiPlus, FiMessageCircle, FiUser, FiClock, 
  FiChevronRight, FiChevronDown, FiMail, FiLock
} from "react-icons/fi";

interface ProductDiscussionsProps {
  productId: string;
  discussions: Discussion[];
  loading: boolean;
  refreshDiscussions: () => void;
}

export default function ProductDiscussions({
  productId,
  discussions,
  loading,
  refreshDiscussions
}: ProductDiscussionsProps) {
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("You must be logged in to create a discussion");
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/products/${productId}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create discussion");
      }
      
      toast.success("Discussion created successfully");
      setTitle("");
      setContent("");
      setIsCreating(false);
      refreshDiscussions();
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast.error("Failed to create discussion");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchComments = async (discussionId: string) => {
    if (comments[discussionId]) {
      return; // Already loaded
    }
    
    setLoadingComments(prev => ({ ...prev, [discussionId]: true }));
    
    try {
      const response = await fetch(`/api/discussions/${discussionId}/comments`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      const data = await response.json();
      setComments(prev => ({ ...prev, [discussionId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(prev => ({ ...prev, [discussionId]: false }));
    }
  };

  const handleToggleDiscussion = (discussionId: string) => {
    if (expandedDiscussionId === discussionId) {
      setExpandedDiscussionId(null);
    } else {
      setExpandedDiscussionId(discussionId);
      fetchComments(discussionId);
    }
  };

  const handleSubmitComment = async (discussionId: string) => {
    if (!session?.user) {
      toast.error("You must be logged in to post a comment");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      
      const createdComment = await response.json();
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [discussionId]: [...(prev[discussionId] || []), createdComment],
      }));
      
      setNewComment("");
      toast.success("Comment posted successfully");
      
      // Refresh discussions to update comment count
      refreshDiscussions();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderDiscussionForm = () => {
    if (!session?.user) {
      return (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <FiLock className="mx-auto text-4xl mb-2 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sign in to join the discussion</h3>
          <p className="text-gray-400 mb-4">
            You need to be logged in to create discussions and post comments.
          </p>
          <Button
            onClick={() => window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.href)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Sign In
          </Button>
        </div>
      );
    }

    if (!isCreating) {
      return (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Join the conversation
          </h3>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center"
          >
            <FiPlus className="mr-2" />
            New Discussion
          </Button>
        </div>
      );
    }

    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Create New Discussion</h3>
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Discussion title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-32 resize-y"
              placeholder="Share your thoughts, questions, or insights about this product..."
              required
            />
          </div>
          <div className="flex space-x-2 justify-end">
            <Button
              type="button"
              onClick={() => setIsCreating(false)}
              className="bg-gray-600 hover:bg-gray-500"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post Discussion"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderDiscussionForm()}

      {discussions.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageCircle className="text-4xl mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-300">No discussions yet</h3>
          <p className="text-gray-400">
            Be the first to start a discussion about this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {discussions.length} Discussion{discussions.length !== 1 ? "s" : ""}
          </h3>
          
          {discussions.map((discussion) => (
            <div key={discussion.id} className="bg-gray-700 rounded-lg overflow-hidden">
              {/* Discussion header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-600 transition"
                onClick={() => handleToggleDiscussion(discussion.id)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">{discussion.title}</h4>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2 text-sm">
                      {discussion._count?.comments || 0} comment{discussion._count?.comments !== 1 ? "s" : ""}
                    </span>
                    {expandedDiscussionId === discussion.id ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronRight />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <div className="flex items-center mr-4">
                    {discussion.user.image ? (
                      <img 
                        src={discussion.user.image} 
                        alt={discussion.user.name || ""} 
                        className="h-5 w-5 rounded-full mr-1"
                      />
                    ) : (
                      <FiUser className="mr-1" />
                    )}
                    <span>{discussion.user.name || discussion.user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1" />
                    <span>{format(new Date(discussion.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                
                <p className="mt-2 text-gray-300">
                  {expandedDiscussionId === discussion.id
                    ? discussion.content
                    : discussion.content.length > 150
                    ? `${discussion.content.substring(0, 150)}...`
                    : discussion.content}
                </p>
              </div>
              
              {/* Comments section */}
              {expandedDiscussionId === discussion.id && (
                <div className="border-t border-gray-600 p-4">
                  <h5 className="font-medium mb-4">
                    Comments ({discussion._count?.comments || 0})
                  </h5>
                  
                  {loadingComments[discussion.id] ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : comments[discussion.id]?.length ? (
                    <div className="space-y-4 mb-4">
                      {comments[discussion.id].map((comment) => (
                        <div key={comment.id} className="bg-gray-600 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-400 mb-1">
                            <div className="flex items-center mr-4">
                              {comment.user.image ? (
                                <img 
                                  src={comment.user.image} 
                                  alt={comment.user.name || ""} 
                                  className="h-5 w-5 rounded-full mr-1"
                                />
                              ) : (
                                <FiUser className="mr-1" />
                              )}
                              <span>{comment.user.name || comment.user.email}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="mr-1" />
                              <span>{format(new Date(comment.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                          <p className="text-gray-200">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No comments yet
                    </div>
                  )}
                  
                  {/* Add comment form */}
                  {session?.user ? (
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <div className="flex-grow">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-y"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Button
                            onClick={() => handleSubmitComment(discussion.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            disabled={submittingComment || !newComment.trim()}
                          >
                            {submittingComment ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <p className="text-gray-400 mb-2">
                        You must be logged in to post a comment
                      </p>
                      <Button
                        onClick={() => window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.href)}
                        className="bg-gray-600 hover:bg-gray-500"
                        size="sm"
                      >
                        <FiMail className="mr-1" />
                        Sign In to Comment
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}