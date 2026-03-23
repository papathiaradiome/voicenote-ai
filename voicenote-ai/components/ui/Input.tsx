import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <View className="w-full gap-1">
      {label && <Text className="font-bold text-slate-800 dark:text-slate-200">{label}</Text>}
      <TextInput
        className={`h-12 w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 ${error ? 'border-red-500' : ''} ${className}`}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
