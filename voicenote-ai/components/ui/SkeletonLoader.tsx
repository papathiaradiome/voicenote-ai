import React from 'react';
import { View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) => {
  return (
    <View 
      style={{ width, height, borderRadius }} 
      className={`bg-slate-200 dark:bg-slate-700 opacity-50 ${className}`} 
    />
  );
};
