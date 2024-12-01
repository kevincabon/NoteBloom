import { Json } from './database';

export interface FeedbackTable {
  Row: {
    content: string;
    created_at: string;
    id: string;
    status: string | null;
    type: string;
    user_id: string | null;
  };
  Insert: {
    content: string;
    created_at?: string;
    id?: string;
    status?: string | null;
    type: string;
    user_id?: string | null;
  };
  Update: {
    content?: string;
    created_at?: string;
    id?: string;
    status?: string | null;
    type?: string;
    user_id?: string | null;
  };
}

export interface FoldersTable {
  Row: {
    color: string;
    created_at: string;
    description: string | null;
    id: string;
    name: string;
    updated_at: string;
    user_id: string;
  };
  Insert: {
    color?: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    name: string;
    updated_at?: string;
    user_id: string;
  };
  Update: {
    color?: string;
    created_at?: string;
    description?: string | null;
    id?: string;
    name?: string;
    updated_at?: string;
    user_id?: string;
  };
}

export interface NotesTable {
  Row: {
    audio_url: string | null;
    content: string | null;
    created_at: string;
    email: string | null;
    folder_id: string | null;
    id: string;
    images: string[] | null;
    is_public: boolean | null;
    links: string[] | null;
    phone: string | null;
    title: string;
    updated_at: string;
    user_id: string | null;
  };
  Insert: {
    audio_url?: string | null;
    content?: string | null;
    created_at?: string;
    email?: string | null;
    folder_id?: string | null;
    id?: string;
    images?: string[] | null;
    is_public?: boolean | null;
    links?: string[] | null;
    phone?: string | null;
    title: string;
    updated_at?: string;
    user_id?: string | null;
  };
  Update: {
    audio_url?: string | null;
    content?: string | null;
    created_at?: string;
    email?: string | null;
    folder_id?: string | null;
    id?: string;
    images?: string[] | null;
    is_public?: boolean | null;
    links?: string[] | null;
    phone?: string | null;
    title?: string;
    updated_at?: string;
    user_id?: string | null;
  };
}

export interface ProfilesTable {
  Row: {
    avatar_url: string | null;
    created_at: string;
    id: string;
    role: string | null;
    username: string | null;
  };
  Insert: {
    avatar_url?: string | null;
    created_at?: string;
    id: string;
    role?: string | null;
    username?: string | null;
  };
  Update: {
    avatar_url?: string | null;
    created_at?: string;
    id?: string;
    role?: string | null;
    username?: string | null;
  };
}