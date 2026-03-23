export const COLORS = {
  primary: '#6366F1', // Indigo
  secondary: '#8B5CF6', // Violet
  accent: '#06B6D4', // Cyan
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#475569',
  }
};

export const PLANS = {
  FREE: { limits: { recordings: 5, transcriptionMin: 30, storageMb: 500, importMb: 10, importMin: 10 } },
  PRO: { limits: { recordings: Infinity, transcriptionMin: 600, storageMb: 10000, importMb: 200, importMin: 120 } },
  BUSINESS: { limits: { recordings: Infinity, transcriptionMin: Infinity, storageMb: 100000, importMb: 1000, importMin: 300 } },
};

export const SUPPORTED_LANGUAGES = ['fr', 'en'];
