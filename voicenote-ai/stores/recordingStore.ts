import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  time: number;
  label?: string;
}

export interface PendingUpload {
  id: string;
  uri: string;
  title: string;
  duration: number;
  language: string;
  bookmarks: Bookmark[];
  createdAt: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // en millisecondes
  audioUri: string | null;
  currentMetering: number; // en db
  language: string; // ex: 'fr-FR'
  bookmarks: Bookmark[];
  pendingUploads: PendingUpload[];
  
  setIsRecording: (val: boolean) => void;
  setIsPaused: (val: boolean) => void;
  setDuration: (val: number) => void;
  setAudioUri: (val: string | null) => void;
  setCurrentMetering: (val: number) => void;
  setLanguage: (val: string) => void;
  addBookmark: (time: number, label?: string) => void;
  resetRecording: () => void;
  
  addPendingUpload: (upload: PendingUpload) => void;
  removePendingUpload: (id: string) => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set) => ({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioUri: null,
      currentMetering: -160,
      language: 'fr-FR',
      bookmarks: [],
      pendingUploads: [],
      
      setIsRecording: (isRecording) => set({ isRecording }),
      setIsPaused: (isPaused) => set({ isPaused }),
      setDuration: (duration) => set({ duration }),
      setAudioUri: (audioUri) => set({ audioUri }),
      setCurrentMetering: (currentMetering) => set({ currentMetering }),
      setLanguage: (language) => set({ language }),
      addBookmark: (time, label) => set((state) => ({ bookmarks: [...state.bookmarks, { time, label }] })),
      resetRecording: () => set({ 
        isRecording: false, 
        isPaused: false, 
        duration: 0, 
        audioUri: null, 
        currentMetering: -160, 
        bookmarks: [] 
      }),
      
      addPendingUpload: (upload) => set((state) => ({ pendingUploads: [...state.pendingUploads, upload] })),
      removePendingUpload: (id) => set((state) => ({ pendingUploads: state.pendingUploads.filter(u => u.id !== id) })),
    }),
    {
      name: 'recording-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pendingUploads: state.pendingUploads, language: state.language }),
    }
  )
);
