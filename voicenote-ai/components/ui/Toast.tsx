import React from 'react';
import { View, Text } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast = ({ message, type = 'info' }: ToastProps) => {
  let bgClass = "bg-slate-800 dark:bg-slate-900";
  if (type === 'success') bgClass = "bg-emerald-500";
  if (type === 'error') bgClass = "bg-red-500";
  
  return (
    <View className={`absolute bottom-10 self-center rounded-xl px-4 py-3 shadow-lg ${bgClass}`}>
      <Text className="text-white text-sm font-bold">{message}</Text>
    </View>
  );
};
