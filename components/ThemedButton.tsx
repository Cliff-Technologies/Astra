import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';

interface ThemedButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({ onPress, title, style, textStyle }: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDark ? '#2196F3' : '#1976D2',
        },
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          {
            color: isDark ? '#FFFFFF' : '#FFFFFF',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

