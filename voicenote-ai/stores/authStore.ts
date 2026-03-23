import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  signInWithEmail: (email: string, pass: string) => Promise<{error: any}>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{error: any}>;
  signInWithGoogle: () => Promise<{error: any}>;
  signInWithApple: () => Promise<{error: any}>;
  signInWithMagicLink: (email: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{error: any}>;
  fetchProfile: (uid: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{error: any}>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      set({ session: data.session, user: data.session.user, isAuthenticated: true });
      await get().fetchProfile(data.session.user.id);
    }
    set({ isLoading: false });
    return { error };
  },

  signUpWithEmail: async (email, password, name) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    set({ isLoading: false });
    return { error };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error };
  },

  signInWithApple: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
    return { error };
  },

  signInWithMagicLink: async (email) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithOtp({ email });
    set({ isLoading: false });
    return { error };
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    set({ isLoading: false });
    return { error };
  },

  fetchProfile: async (uid) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (!error && data) {
      set({ profile: data as unknown as User });
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) return { error: { message: 'Not logged in' } };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
      set({ profile: { ...profile, ...updates } as User });
    }
    return { error };
  },

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user || null, isAuthenticated: !!session, isLoading: false });
      if (session?.user) {
        get().fetchProfile(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null, isAuthenticated: !!session, isLoading: false });
      if (session?.user) {
        get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  }
}));
