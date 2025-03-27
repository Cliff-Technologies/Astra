import React from 'react';
import { View, ViewStyle, useColorScheme } from 'react-native';

interface ThemedViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function ThemedView({ children, style }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
