import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors } from '@/lib/theme/tokens';

type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface AppTextProps extends TextProps, PropsWithChildren {
  variant?: AppTextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text style={[styles.base, styles[variant], { color, textAlign: align }, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: '500',
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
