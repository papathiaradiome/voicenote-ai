-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. Create Tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  subscription_plan text default 'free',
  subscription_status text default 'active',
  default_language text default 'fr',
  storage_used_mb numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.folders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text default 'indigo',
  icon text default 'folder',
  parent_folder_id uuid references public.folders(id) on delete cascade,
  is_smart boolean default false,
  smart_category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null,
  audio_url text,
  audio_duration_seconds numeric,
  audio_format text,
  transcription text,
  transcription_language text,
  transcription_status text default 'pending',
  summary_short text,
  summary_detailed text,
  key_points jsonb default '[]'::jsonb,
  action_items jsonb default '[]'::jsonb,
  decisions jsonb default '[]'::jsonb,
  questions jsonb default '[]'::jsonb,
  mind_map_data jsonb default '{}'::jsonb,
  speakers jsonb default '[]'::jsonb,
  diarization_data jsonb default '[]'::jsonb,
  bookmarks jsonb default '[]'::jsonb,
  tags text[] default array[]::text[],
  source_type text default 'recording',
  source_url text,
  is_favorite boolean default false,
  is_archived boolean default false,
  sentiment_score numeric,
  word_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.flashcards (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  answer text not null,
  difficulty text default 'medium',
  next_review_at timestamptz,
  repetition_count integer default 0,
  ease_factor numeric default 2.5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.collaborations (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references public.notes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  collaborator_email text not null,
  collaborator_id uuid references public.profiles(id) on delete set null,
  role text default 'reader',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.annotations (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text_selection text,
  comment text not null,
  timestamp_start numeric,
  timestamp_end numeric,
  mentions text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  external_event_id text,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  meeting_url text,
  platform text,
  auto_record boolean default false,
  note_id uuid references public.notes(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.usage_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  recordings_count integer default 0,
  transcription_minutes numeric default 0,
  ai_questions_count integer default 0,
  storage_used_mb numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint usage_tracking_user_month_key unique (user_id, month)
);

-- 2. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.flashcards enable row level security;
alter table public.collaborations enable row level security;
alter table public.annotations enable row level security;
alter table public.calendar_events enable row level security;
alter table public.usage_tracking enable row level security;

-- Policies: Profiles
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Policies: Folders
create policy "Users can view their own folders" on public.folders for select using (auth.uid() = user_id);
create policy "Users can insert their own folders" on public.folders for insert with check (auth.uid() = user_id);
create policy "Users can update their own folders" on public.folders for update using (auth.uid() = user_id);
create policy "Users can delete their own folders" on public.folders for delete using (auth.uid() = user_id);

-- Policies: Notes (Owner + Collaborator)
create policy "Users can view their own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Collaborators can view notes" on public.notes for select using (
  exists (
    select 1 from public.collaborations 
    where note_id = notes.id 
    and collaborator_id = auth.uid() 
    and status = 'accepted'
  )
);
create policy "Users can insert their own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.notes for delete using (auth.uid() = user_id);

-- Policies: Collaborations
create policy "Owners and collaborators can view collaborations" on public.collaborations for select using (
  auth.uid() = owner_id or auth.uid() = collaborator_id or (auth.jwt() ->> 'email') = collaborator_email
);
create policy "Owners can manage collaborations" on public.collaborations for all using (auth.uid() = owner_id);
create policy "Collaborators can update their status" on public.collaborations for update using (
  auth.uid() = collaborator_id or (auth.jwt() ->> 'email') = collaborator_email
);

-- Policies: Annotations
create policy "Users can view own annotations" on public.annotations for select using (auth.uid() = user_id);
create policy "Note collaborators can view annotations" on public.annotations for select using (
  exists (
    select 1 from public.collaborations 
    where note_id = public.annotations.note_id 
    and collaborator_id = auth.uid() 
    and status = 'accepted'
  )
);
create policy "Users can manage own annotations" on public.annotations for all using (auth.uid() = user_id);

-- General Policies for purely owned data
create policy "Users can manage own ai_conversations" on public.ai_conversations for all using (auth.uid() = user_id);
create policy "Users can manage own flashcards" on public.flashcards for all using (auth.uid() = user_id);
create policy "Users can manage own calendar_events" on public.calendar_events for all using (auth.uid() = user_id);
create policy "Users can view own usage_tracking" on public.usage_tracking for select using (auth.uid() = user_id);

-- 3. Triggers
-- a) Auto-create profile on auth.users insert
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- b) Auto-create smart folders on profile creation
create or replace function public.handle_new_profile_folders()
returns trigger as $$
begin
  insert into public.folders (user_id, name, icon, is_smart, smart_category) values
    (new.id, 'Réunions', 'briefcase', true, 'meetings'),
    (new.id, 'Cours', 'book', true, 'courses'),
    (new.id, 'Interviews', 'mic', true, 'interviews'),
    (new.id, 'Personnel', 'user', true, 'personal'),
    (new.id, 'Idées', 'lightbulb', true, 'ideas');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_folders
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile_folders();

-- 4. Storage Buckets & Policies
insert into storage.buckets (id, name, public, file_size_limit) 
values 
  ('audio-files', 'audio-files', false, 524288000), -- 500MB
  ('avatars', 'avatars', true, 5242880),           -- 5MB
  ('exports', 'exports', false, 104857600)         -- 100MB
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

create policy "Audio files ownership" on storage.objects for all using (bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Avatars public view" on storage.objects for select using (bucket_id = 'avatars');
create policy "Avatars ownership" on storage.objects for all using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Exports ownership" on storage.objects for all using (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Performance Indexes
create index idx_notes_user_created on public.notes(user_id, created_at desc);
create index idx_notes_folder on public.notes(folder_id);
create index idx_notes_tags on public.notes using gin (tags);

alter table public.notes add column fts tsvector generated always as (to_tsvector('french', coalesce(transcription, ''))) stored;
create index idx_notes_fts on public.notes using gin (fts);

create index idx_usage_tracking_user_month on public.usage_tracking(user_id, month);
