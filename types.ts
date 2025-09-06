
export interface UserProfile {
  username: string;
  role: 'admin' | 'user';
}

export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface VideoData {
    url: string;
    blob: Blob;
}

export interface Video {
  id: string;
  prompt: string;
  description: string;
  createdAt: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}