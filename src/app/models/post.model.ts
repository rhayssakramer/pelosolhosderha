export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  comments?: Comment[];
  commentCount?: number;
}

export interface Comment {
  id: string;
  name: string;
  date: string;
  text: string;
  avatar?: string;
  replies?: Comment[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface BlogSettings {
  blogTitle: string;
  blogDescription: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}
