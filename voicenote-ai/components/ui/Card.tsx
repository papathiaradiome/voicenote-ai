import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <View 
      className={`bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-none gap-3 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
