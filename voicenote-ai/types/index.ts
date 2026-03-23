// types/index.ts

export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type SourceType = 'recording' | 'import_audio' | 'import_youtube' | 'import_video';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ThemeType = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  full_name: string;
  avatar_url: string;
  subscription_plan: SubscriptionPlan;
  default_language: string;
  storage_used_mb: number;
}

export interface KeyPoint {
  point: string;
  timestamp: number;
}

export interface ActionItem {
  task: string;
  assignee: string;
}

export interface Speaker {
  id: string;
  name: string;
  color: string;
}

export interface DiarizationSegment {
  speaker_id: string;
  start: number;
  end: number;
  text: string;
}

export interface Bookmark {
  timestamp: number;
  label: string;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  audio_url: string;
  audio_duration_seconds: number;
  transcription: string;
  transcription_status: TranscriptionStatus;
  transcription_language: string;
  summary_short: string;
  summary_detailed: string;
  key_points: KeyPoint[];
  action_items: ActionItem[];
  decisions: string[];
  questions: string[];
  mind_map_data: Record<string, any>;
  speakers: Speaker[];
  diarization_data: DiarizationSegment[];
  bookmarks: Bookmark[];
  tags: string[];
  source_type: SourceType;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  parent_folder_id: string | null;
  is_smart: boolean;
  smart_category: string;
  notes_count?: number;
}

export interface Flashcard {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  difficulty: DifficultyLevel;
  next_review_at: string;
  repetition_count: number;
  ease_factor: number;
}
