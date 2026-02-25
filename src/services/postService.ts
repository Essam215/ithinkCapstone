import api from "./api";
import type { Post, PostType, PostVisibility } from "../types";
import { mockNotifications, mockPosts } from "../data/mockData";
import {
  getMockAdminIds,
  getMockUserById,
  updateMockUser,
} from "../data/mockUsers";

// MVP Mode: Set to true to use mock data (no backend required)
const MVP_MODE = true;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function nowIso() {
  return new Date().toISOString();
}

function createMockNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
}) {
  mockNotifications.unshift({
    id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    read: false,
    createdAt: nowIso(),
    link: params.link,
  });
}

function enrichPostAuthor(post: Post): Post {
  if (post.authorName) return post;
  const u = getMockUserById(post.authorId);
  return {
    ...post,
    authorName: u ? `${u.firstName} ${u.lastName}` : "Unknown",
  };
}

export async function getHomeFeed(): Promise<Post[]> {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const approvedPublic = mockPosts
          .filter((p) => p.visibility === "public" && p.status === "approved")
          .map(enrichPostAuthor);

        const pinned = approvedPublic
          .filter((p) => p.isPinned)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        const regular = approvedPublic
          .filter((p) => !p.isPinned)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

        resolve([...pinned, ...regular]);
      }, 250);
    });
  }

  const response = await api.get<ApiResponse<Post[]>>("/posts?feed=1");
  return response.data.data || [];
}

export async function getMyPosts(authorId: string): Promise<Post[]> {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          mockPosts
            .filter((p) => p.authorId === authorId)
            .map(enrichPostAuthor)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        );
      }, 250);
    });
  }

  const response = await api.get<ApiResponse<Post[]>>("/posts?mine=1");
  return response.data.data || [];
}

export async function createPost(input: {
  content: string;
  visibility: PostVisibility;
  type: PostType;
  authorId: string;
}): Promise<Post> {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const author = getMockUserById(input.authorId);
        const post: Post = {
          id: `p-${Date.now()}`,
          authorId: input.authorId,
          authorName: author ? `${author.firstName} ${author.lastName}` : "Unknown",
          content: input.content,
          visibility: input.visibility,
          type: input.type,
          status: "pending",
          isPinned: false,
          createdAt: nowIso(),
        };

        mockPosts.unshift(post);

        // Notify admins to review & rate.
        const adminIds = getMockAdminIds();
        adminIds.forEach((adminId) => {
          createMockNotification({
            userId: adminId,
            title: "New Post Submitted",
            message: "A new post was submitted and needs admin review.",
            type: "info",
            link: "/admin?tab=posts",
          });
        });

        resolve(post);
      }, 400);
    });
  }

  const response = await api.post<ApiResponse<Post>>("/posts", {
    content: input.content,
    visibility: input.visibility,
    type: input.type,
  });
  return response.data.data;
}

export async function getPendingPosts(): Promise<Post[]> {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          mockPosts
            .filter((p) => p.status === "pending")
            .map(enrichPostAuthor)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        );
      }, 250);
    });
  }

  const response = await api.get<ApiResponse<Post[]>>("/post-review?status=pending");
  return response.data.data || [];
}

export async function reviewPost(input: {
  postId: string;
  action: "approve" | "reject";
  feedback?: string;
  pointsAwarded?: number;
  pin?: boolean;
  publishAsPublic?: boolean;
}): Promise<void> {
  if (MVP_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = mockPosts.find((p) => p.id === input.postId);
        if (!post) return resolve();

        const adminUser = getMockUserById("1"); // single admin in MVP
        const reviewerName = adminUser
          ? `${adminUser.firstName} ${adminUser.lastName}`
          : "Admin";

        const approved = input.action === "approve";
        post.status = approved ? "approved" : "rejected";
        post.feedback = input.feedback || "";
        post.pointsAwarded = approved ? Math.max(0, input.pointsAwarded || 0) : 0;
        post.reviewedBy = "1";
        post.reviewedAt = nowIso();
        post.updatedAt = nowIso();

        if (typeof input.pin === "boolean") {
          post.isPinned = input.pin;
        }
        if (input.publishAsPublic) {
          post.visibility = "public";
        }

        if (approved && post.pointsAwarded && post.pointsAwarded > 0) {
          const author = getMockUserById(post.authorId);
          if (author) {
            updateMockUser(post.authorId, {
              points: (author.points || 0) + post.pointsAwarded,
            });
          }
        }

        // Notify the author
        createMockNotification({
          userId: post.authorId,
          title: approved ? "Post Approved" : "Post Rejected",
          message: approved
            ? `Your post was approved by ${reviewerName}. You earned ${post.pointsAwarded || 0} points.`
            : `Your post was rejected by ${reviewerName}.${post.feedback ? " Feedback: " + post.feedback : ""}`,
          type: approved ? "success" : "error",
          link: "/posts",
        });

        resolve();
      }, 450);
    });
  }

  await api.post("/post-review", {
    postId: input.postId,
    action: input.action,
    feedback: input.feedback,
    pointsAwarded: input.pointsAwarded,
    pin: input.pin,
    publishAsPublic: input.publishAsPublic,
  });
}

export async function updatePostPin(postId: string, isPinned: boolean): Promise<void> {
  if (MVP_MODE) {
    const post = mockPosts.find((p) => p.id === postId);
    if (post) {
      post.isPinned = isPinned;
      post.updatedAt = nowIso();
    }
    return;
  }

  await api.put("/posts", { postId, isPinned });
}

