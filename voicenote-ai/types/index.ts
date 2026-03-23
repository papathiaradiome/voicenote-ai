export type ThemeType = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_plan?: 'free' | 'pro' | 'business';
  created_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
  notes_count?: number;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  audio_url?: string;
  duration?: number;
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_favorite: boolean;
  folder_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
