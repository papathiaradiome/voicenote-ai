import { useNotesStore } from '../stores/notesStore';

export const useNotes = () => {
  const store = useNotesStore();
  
  const getMonthlyStats = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filtre des notes créées ce mois-ci dans le store local
    const monthNotes = store.notes.filter(n => new Date(n.created_at) >= startOfMonth);
    
    const count = monthNotes.length;
    const totalSeconds = monthNotes.reduce((acc, note) => acc + (note.duration || 0), 0);
    const totalWords = monthNotes.reduce((acc, note) => {
      if (!note.content) return acc;
      return acc + note.content.split(/\s+/).length;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return {
      count,
      duration: { hours, minutes },
      words: totalWords
    };
  };

  return { ...store, getMonthlyStats };
};
