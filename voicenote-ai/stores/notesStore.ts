import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Note, Folder } from '../types';

interface NotesState {
  notes: Note[];
  recentNotes: Note[];
  favoriteNotes: Note[];
  folders: Folder[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  page: number;
  
  fetchNotes: (reset?: boolean) => Promise<void>;
  fetchRecentNotes: () => Promise<void>;
  fetchFavoriteNotes: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  
  createNote: (note: Partial<Note>) => Promise<{ data: Note | null; error: any }>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<{ error: any }>;
  deleteNote: (id: string) => Promise<{ error: any }>;
  toggleFavorite: (id: string, isFav: boolean) => Promise<{ error: any }>;
  
  searchNotes: (query: string) => Promise<Note[]>;
  fetchNotesByFolder: (folderId: string) => Promise<Note[]>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  recentNotes: [],
  favoriteNotes: [],
  folders: [],
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  page: 0,
  
  fetchNotes: async (reset = false) => {
    const { page, notes, hasMore } = get();
    if (!reset && !hasMore) return;
    
    const currentPage = reset ? 0 : page;
    const limit = 20;
    
    set({ [reset ? 'isLoading' : 'isFetchingMore']: true });
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ isLoading: false, isFetchingMore: false });
      return;
    }
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .range(currentPage * limit, (currentPage + 1) * limit - 1);
      
    if (!error && data) {
      set({ 
        notes: reset ? data : [...notes, ...data],
        page: currentPage + 1,
        hasMore: data.length === limit,
        isLoading: false,
        isFetchingMore: false
      });
    } else {
      set({ isLoading: false, isFetchingMore: false });
    }
  },
  
  fetchRecentNotes: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (!error && data) set({ recentNotes: data });
  },
  
  fetchFavoriteNotes: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });
      
    if (!error && data) set({ favoriteNotes: data });
  },

  fetchFolders: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    const { data, error } = await supabase
      .from('folders')
      .select('*, notes(count)')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(4);
      
    if (!error && data) {
      const foldersWithCount = data.map((f: any) => ({
        ...f,
        notes_count: f.notes?.[0]?.count || 0
      }));
      set({ folders: foldersWithCount });
    }
  },
  
  createNote: async (note) => {
    set({ isLoading: true });
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: userData.user?.id })
      .select()
      .single();
      
    if (!error && data) {
      get().fetchNotes(true);
      get().fetchRecentNotes();
    }
    set({ isLoading: false });
    return { data, error };
  },
  
  updateNote: async (id, updates) => {
    const { error } = await supabase.from('notes').update(updates).eq('id', id);
    if (!error) {
      const { notes, recentNotes, favoriteNotes } = get();
      set({
        notes: notes.map(n => n.id === id ? { ...n, ...updates } : n),
        recentNotes: recentNotes.map(n => n.id === id ? { ...n, ...updates } : n),
        favoriteNotes: updates.is_favorite === false 
          ? favoriteNotes.filter(n => n.id !== id)
          : favoriteNotes.map(n => n.id === id ? { ...n, ...updates } : n)
      });
      if (updates.is_favorite) get().fetchFavoriteNotes();
    }
    return { error };
  },
  
  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      const { notes, recentNotes, favoriteNotes } = get();
      set({
        notes: notes.filter(n => n.id !== id),
        recentNotes: recentNotes.filter(n => n.id !== id),
        favoriteNotes: favoriteNotes.filter(n => n.id !== id)
      });
    }
    return { error };
  },
  
  toggleFavorite: async (id, isFav) => {
    return await get().updateNote(id, { is_favorite: isFav });
  },
  
  searchNotes: async (query) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userData.user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      
    return (!error && data) ? data : [];
  },
  
  fetchNotesByFolder: async (folderId) => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    return data || [];
  }
}));
