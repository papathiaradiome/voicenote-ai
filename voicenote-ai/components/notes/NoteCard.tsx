import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Clock, Folder, Star } from 'lucide-react-native';
import { formatDistanceToNow, isYesterday, isToday, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Note } from '../../types';
import { useRouter } from 'expo-router';

interface NoteCardProps {
  note: Note;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export const NoteCard = ({ note, onToggleFavorite, onDelete }: NoteCardProps) => {
  const { i18n, t } = useTranslation();
  const router = useRouter();

  const getDateText = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const localeObj = i18n.language === 'fr' ? fr : enUS;
      if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true, locale: localeObj });
      if (isYesterday(d)) return t('common.yesterday', 'Hier');
      return format(d, 'd MMM', { locale: localeObj });
    } catch {
      return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const statusLabels: Record<string, string> = {
    pending: t('status.pending', 'En attente'),
    processing: t('status.processing', 'En cours'),
    completed: t('status.completed', 'Terminé'),
    failed: t('status.failed', 'Échoué')
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLongPress = () => {
    Alert.alert(
      t('common.options', 'Options'),
      note.title,
      [
        { text: note.is_favorite ? t('notes.removeFav', 'Retirer des favoris') : t('notes.addFav', 'Ajouter aux favoris'), onPress: onToggleFavorite },
        { text: t('common.delete', 'Supprimer'), onPress: onDelete, style: 'destructive' },
        { text: t('common.cancel', 'Annuler'), style: 'cancel' }
      ]
    );
  };

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/notes/${note.id}` as any)}
      onLongPress={handleLongPress}
      className="bg-white dark:bg-slate-800 p-4 rounded-2xl w-64 mr-4 shadow-sm border border-slate-100 dark:border-slate-700"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-bold text-slate-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
          {note.title || t('notes.untitled', 'Note sans titre')}
        </Text>
        <TouchableOpacity onPress={onToggleFavorite} className="p-1">
          <Star size={20} color={note.is_favorite ? '#F59E0B' : '#94A3B8'} fill={note.is_favorite ? '#F59E0B' : 'transparent'} />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center justify-between mt-auto pt-4 gap-2 flex-wrap">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-slate-500 dark:text-slate-400">{getDateText(note.created_at)}</Text>
          <View className="flex-row items-center">
            <Clock size={12} color="#94A3B8" className="mr-1" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">{formatDuration(note.duration)}</Text>
          </View>
        </View>
        
        <View className={`px-2 py-1 rounded-full ${getStatusColor(note.transcription_status)}`}>
          <Text className={`text-[10px] font-bold ${getStatusColor(note.transcription_status).split(' ')[1]}`}>
            {statusLabels[note.transcription_status] || note.transcription_status}
          </Text>
        </View>
      </View>

      {note.folder_id && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <Folder size={12} color="#6366F1" className="mr-1" />
          <Text className="text-xs text-indigo-500 font-medium">{t('notes.folder', 'Dossier')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
