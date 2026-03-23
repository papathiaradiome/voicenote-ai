import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Bell, Search, Folder, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useNotes } from '../../hooks/useNotes';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { NoteCard } from '../../components/notes/NoteCard';
import { RecordFAB } from '../../components/dashboard/RecordFAB';
import { StatsSection } from '../../components/dashboard/StatsSection';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const { notes, recentNotes, favoriteNotes, folders, isLoading, fetchNotes, fetchRecentNotes, fetchFavoriteNotes, fetchFolders, getMonthlyStats, toggleFavorite, deleteNote } = useNotes();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    await Promise.all([
      fetchNotes(true),
      fetchRecentNotes(),
      fetchFavoriteNotes(),
      fetchFolders()
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const stats = getMonthlyStats();
  const localeObj = i18n.language === 'fr' ? fr : enUS;
  const todayDate = format(new Date(), "EEEE d MMMM", { locale: localeObj });

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6 flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 items-center justify-center mr-3">
                <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text className="text-sm text-slate-500 dark:text-slate-400 capitalize">{todayDate}</Text>
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                Bonjour, {profile?.full_name?.split(' ')[0] || 'Utilisateur'} 👋
              </Text>
            </View>
          </View>
          <TouchableOpacity className="relative p-2">
            <Bell size={24} color="#64748B" />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          className="mx-6 mb-8 flex-row items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
          onPress={() => router.push('/(tabs)/search')}
        >
          <Search size={20} color="#94A3B8" className="mr-3" />
          <Text className="text-slate-400">{t('dashboard.searchPlaceholder', 'Rechercher dans vos notes...')}</Text>
        </TouchableOpacity>

        {/* Stats */}
        {isLoading && notes.length === 0 ? (
          <View className="px-6 mb-8 flex-row justify-between">
            <SkeletonLoader width="30%" height={100} borderRadius={16} />
            <SkeletonLoader width="30%" height={100} borderRadius={16} />
            <SkeletonLoader width="30%" height={100} borderRadius={16} />
          </View>
        ) : (
          <StatsSection stats={stats} />
        )}

        {/* Recent Notes */}
        <View className="mb-8">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.recent', 'Notes récentes')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/folders')}>
              <Text className="text-indigo-500 font-semibold">{t('common.seeAll', 'Voir tout')} →</Text>
            </TouchableOpacity>
          </View>

          {isLoading && recentNotes.length === 0 ? (
            <View className="pl-6 flex-row">
              <SkeletonLoader width={250} height={150} borderRadius={16} className="mr-4" />
              <SkeletonLoader width={250} height={150} borderRadius={16} />
            </View>
          ) : recentNotes.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {recentNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onToggleFavorite={() => toggleFavorite(note.id, !note.is_favorite)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="mx-6 p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl items-center border border-dashed border-slate-200 dark:border-slate-800">
              <Text className="text-slate-500 dark:text-slate-400 text-center mb-4">{t('dashboard.noNotes', 'Pas encore de notes')}</Text>
              <TouchableOpacity className="bg-indigo-500 px-6 py-3 rounded-full">
                <Text className="text-white font-bold">{t('dashboard.recordFirst', 'Enregistrez votre première note !')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Favorites */}
        {favoriteNotes.length > 0 && (
          <View className="mb-8 px-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.favorites', 'Favoris')} ⭐</Text>
              <TouchableOpacity>
                <Text className="text-indigo-500 font-semibold">{t('common.seeAll', 'Voir tout')}</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {favoriteNotes.slice(0, 3).map((note) => (
                <TouchableOpacity key={note.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-800" onPress={() => router.push(`/notes/${note.id}` as any)}>
                  <View className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 items-center justify-center mr-3">
                    <Star size={20} color="#F59E0B" fill="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-slate-900 dark:text-white" numberOfLines={1}>{note.title}</Text>
                    <Text className="text-xs text-slate-500">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: localeObj })}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Folders */}
        <View className="mb-24 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.folders', 'Dossiers')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/folders')}>
              <Text className="text-indigo-500 font-semibold">{t('common.seeAll', 'Voir tout')} →</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {folders.length > 0 ? folders.map((folder) => (
              <TouchableOpacity key={folder.id} className="w-[48%] bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${folder.color}20` }}>
                  <Folder size={20} color={folder.color} />
                </View>
                <Text className="font-bold text-slate-900 dark:text-white mb-1" numberOfLines={1}>{folder.name}</Text>
                <Text className="text-xs text-slate-500">{folder.notes_count || 0} notes</Text>
              </TouchableOpacity>
            )) : (
              <Text className="text-slate-500 text-center w-full py-4">{t('dashboard.noFolders', 'Aucun dossier')}</Text>
            )}
          </View>
        </View>

      </ScrollView>

      {/* FAB */}
      <RecordFAB />
    </View>
  );
}
