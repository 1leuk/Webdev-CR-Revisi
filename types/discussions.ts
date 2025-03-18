import { User } from "./types";

export type Discussion = {
  id: string;
  title: string;
  content: string;
  userId: string;
  user: User;
  productId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
};

export type Comment = {
  id: string;
  content: string;
  userId: string;
  user: User;
  discussionId: string;
  createdAt: string;
  updatedAt: string;
};