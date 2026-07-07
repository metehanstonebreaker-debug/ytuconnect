/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserPreferences {
  username: string;
  studentId: string;
  department: string;
  interestedFields: string[];
  interestedClubs: string[];
  excludedCategories: string[]; // Items the user filters out (does not want to see)
  isOnboarded: boolean;
  avatar?: string;
  themeColor?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  authorStudentId?: string; // School number of comment author
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  time: string;
  content: string;
  likes: number;
  likedByMe?: boolean;
  department?: string; // Optional: specific to a department
  field: string; // e.g. 'Teknoloji & Yazılım', 'Sosyal & Eğlence', 'Kariyer & Staj', 'Akademik', 'Kültür & Sanat', 'Spor'
  club?: string; // Optional: posted by a club
  isPinned?: boolean;
  image?: string; // Optional: attached image URL/base64
  location?: string; // Optional: attached location description
  comments?: Comment[]; // List of comments on this post
  createdAt?: string; // ISO timestamp
  authorStudentId?: string; // School number of post author
}

export interface Exam {
  id: string;
  course: string;
  date: string;
  month: string;
  time: string;
  room: string;
  department: string;
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface Story {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  gradientClass?: string;
  image?: string;
  video?: string;
  location?: string;
  textX?: number;
  textY?: number;
  authorStudentId?: string; // School number of story author
}

export interface RegisteredUser {
  studentId: string; // 8-digit school number (Unique Key)
  username: string; // Nickname
  password?: string;
  department: string;
  interestedFields: string[];
  interestedClubs: string[];
  avatar: string;
  bio?: string;
  createdAt: string;
  friends?: string[];
  friendRequests?: string[];
  hasUnreadMessages?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
  seenBy?: string[];
}
