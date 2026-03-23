import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonProps) => {
  let baseStyles = "w-full h-12 rounded-xl flex items-center justify-center flex-row ";
  let textStyles = "text-center font-bold ";

  if (variant === 'primary') {
    baseStyles += "bg-indigo-500 "; // primary #6366F1
    textStyles += "text-white ";
  } else if (variant === 'secondary') {
    baseStyles += "bg-violet-500 "; // secondary #8B5CF6
    textStyles += "text-white ";
  } else if (variant === 'outline') {
    baseStyles += "bg-transparent border border-slate-300 dark:border-slate-600 ";
    textStyles += "text-slate-900 dark:text-slate-100 ";
  } else if (variant === 'ghost') {
    baseStyles += "bg-transparent ";
    textStyles += "text-indigo-500 dark:text-indigo-400 ";
  }

  if (disabled) {
    baseStyles += "opacity-50 ";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      className={baseStyles + className}
    >
      {isLoading ? (
        <ActivityIndicator color={(variant === 'outline' || variant === 'ghost') ? '#6366F1' : '#FFFFFF'} />
      ) : (
        <Text className={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
