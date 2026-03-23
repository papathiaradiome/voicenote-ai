import React from 'react';
import { View, Text } from 'react-native';
import { FileText, Clock, MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export interface StatsProps {
  count: number;
  duration: { hours: number; minutes: number };
  words: number;
}

export const StatsSection = ({ stats }: { stats: StatsProps }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-between mb-8 px-6">
      <View className="flex-1 bg-indigo-50 dark:bg-indigo-900/40 p-4 rounded-2xl mr-2 items-center border border-indigo-100 dark:border-indigo-800">
        <FileText size={20} color="#6366F1" className="mb-2" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{stats.count}</Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 capitalize">{t('dashboard.stats.notes', 'notes')}</Text>
      </View>
      <View className="flex-1 bg-violet-50 dark:bg-violet-900/40 p-4 rounded-2xl mx-1 items-center border border-violet-100 dark:border-violet-800">
        <Clock size={20} color="#8B5CF6" className="mb-2" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          {stats.duration.hours > 0 ? `${stats.duration.hours}h ` : ''}{stats.duration.minutes}m
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 capitalize">{t('dashboard.stats.recorded', 'enregistrées')}</Text>
      </View>
      <View className="flex-1 bg-cyan-50 dark:bg-cyan-900/40 p-4 rounded-2xl ml-2 items-center border border-cyan-100 dark:border-cyan-800">
        <MessageSquare size={20} color="#06B6D4" className="mb-2" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white">{stats.words > 1000 ? `${(stats.words/1000).toFixed(1)}k` : stats.words}</Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 capitalize">{t('dashboard.stats.words', 'mots')}</Text>
      </View>
    </View>
  );
};
