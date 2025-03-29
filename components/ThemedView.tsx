import React from 'react';
import { View, ViewStyle, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  children, 
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View 
      style={[{ backgroundColor }, style]} 
      {...otherProps}
    >
      {children}
    </View>
  );
}
