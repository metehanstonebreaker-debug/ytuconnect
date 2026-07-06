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
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
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
}

