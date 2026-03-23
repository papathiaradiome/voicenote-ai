import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'pro';
  className?: string;
}

export const Badge = ({ label, variant = 'info', className = '' }: BadgeProps) => {
  let bgClass = "bg-slate-200 dark:bg-slate-700";
  let textClass = "text-slate-800 dark:text-slate-200";

  switch (variant) {
    case 'success': bgClass = "bg-emerald-100 dark:bg-emerald-900/30"; textClass = "text-emerald-600 dark:text-emerald-400"; break;
    case 'warning': bgClass = "bg-amber-100 dark:bg-amber-900/30"; textClass = "text-amber-600 dark:text-amber-400"; break;
    case 'error': bgClass = "bg-red-100 dark:bg-red-900/30"; textClass = "text-red-600 dark:text-red-400"; break;
    case 'pro': bgClass = "bg-violet-100 dark:bg-violet-900/30"; textClass = "text-violet-600 dark:text-violet-400 font-bold"; break;
    case 'info': bgClass = "bg-cyan-100 dark:bg-cyan-900/30"; textClass = "text-cyan-600 dark:text-cyan-400"; break;
  }

  return (
    <View className={`rounded-full px-3 py-1 items-center justify-center ${bgClass} ${className}`}>
      <Text className={`text-xs ${textClass}`}>{label}</Text>
    </View>
  );
};
