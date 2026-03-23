import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mDisplay = m.toString().padStart(2, '0');
  const sDisplay = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mDisplay}:${sDisplay}` : `${m}:${sDisplay}`;
};

export const formatRelativeDate = (dateString: string, locale: 'fr' | 'en' = 'fr'): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: locale === 'fr' ? fr : enUS 
    });
  } catch (error) {
    return dateString;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
