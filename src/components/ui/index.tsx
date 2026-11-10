import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text as RNText,
  StyleSheet,
  View,
  type StyleProp,
  type TextProps as RNTextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, HIT, radii, spacing, type, type ColorName, type TypeVariant } from '@/theme/tokens';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ---------- Text ---------- */

type TextProps = RNTextProps & { variant?: TypeVariant; color?: ColorName; center?: boolean };

export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[type[variant], { color: colors[color] }, center && { textAlign: 'center' }, style]}
    />
  );
}

/* ---------- Screen ---------- */

export function Screen({
  children,
  edges = ['top'],
  style,
}: {
  children: ReactNode;
  edges?: ('top' | 'bottom')[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

/* ---------- Header: back on the left, at most two actions on the right ---------- */

export function Header({
  title,
  back = true,
  right,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {back && (
          <IconButton
            icon="chevron-back"
            label="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        )}
      </View>
      {title ? (
        <Text variant="heading" numberOfLines={1} style={styles.headerTitle} accessibilityRole="header">
          {title}
        </Text>
      ) : (
        <View style={styles.headerTitle} />
      )}
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

/* ---------- Buttons ---------- */

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style, testID }: ButtonProps) {
  const primary = variant === 'primary';
  const fg = primary ? colors.onGold : colors.text;
  const content = (
    <View style={styles.buttonInner}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <RNText style={[type.bodyStrong, { color: fg }]}>{title}</RNText>
        </>
      )}
    </View>
  );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !primary && styles.buttonGhost,
        (pressed || disabled) && { opacity: 0.7 },
        style,
      ]}>
      {primary ? (
        <LinearGradient
          colors={['#F3CB73', colors.gold, colors.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonFill}>
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.buttonFill}>{content}</View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  active,
  size = HIT,
  plain,
  testID,
}: {
  icon: IconName;
  /** Read by screen readers; icon-only buttons must always have one. */
  label: string;
  onPress?: () => void;
  active?: boolean;
  size?: number;
  plain?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      hitSlop={size < HIT ? (HIT - size) / 2 : 0}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        plain && styles.iconButtonPlain,
        pressed && { opacity: 0.6 },
      ]}>
      <Ionicons name={icon} size={Math.round(size * 0.46)} color={active ? colors.gold : colors.text} />
    </Pressable>
  );
}

/* ---------- Surfaces ---------- */

export function Card({
  children,
  onPress,
  style,
  accent,
  label,
  testID,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
  label?: string;
  testID?: string;
}) {
  const base = [styles.card, accent && styles.cardAccent, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && { opacity: 0.8 }]}>
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
}) {
  const fg = selected ? colors.onGold : colors.text;
  const body = (
    <>
      {icon && <Ionicons name={icon} size={14} color={selected ? colors.onGold : colors.gold} />}
      <RNText style={[type.label, { color: fg }]}>{label}</RNText>
    </>
  );
  const style = [styles.chip, selected && styles.chipSelected];
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={8}
      onPress={onPress}
      style={style}>
      {body}
    </Pressable>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  left,
  testID,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  left?: ReactNode;
  testID?: string;
}) {
  const body = (
    <>
      {left ?? (icon && <Ionicons name={icon} size={22} color={colors.gold} />)}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      {body}
    </Pressable>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {action && (
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onAction}>
          <Text variant="bodyStrong" color="gold">
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- States ---------- */

export function Skeleton({ height = 16, width = '100%', radius = radii.sm }: { height?: number; width?: number | `${number}%`; radius?: number }) {
  const [opacity] = useState(() => new Animated.Value(0.35));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height, width, borderRadius: radius, backgroundColor: colors.surfaceRaised, opacity }}
    />
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: spacing.md, padding: spacing.lg }} accessibilityLabel="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={72} radius={radii.md} />
      ))}
    </View>
  );
}

function StateView({
  icon,
  title,
  message,
  action,
  onAction,
  tint,
}: {
  icon: IconName;
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
  tint: string;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={28} color={tint} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      {message && (
        <Text color="textSecondary" center>
          {message}
        </Text>
      )}
      {action && <Button title={action} onPress={onAction} variant="ghost" style={{ marginTop: spacing.sm }} />}
    </View>
  );
}

export function EmptyState(props: { icon?: IconName; title: string; message?: string; action?: string; onAction?: () => void }) {
  return <StateView icon={props.icon ?? 'compass-outline'} tint={colors.gold} {...props} />;
}

export function ErrorState(props: { title: string; message?: string; action?: string; onAction?: () => void }) {
  return <StateView icon="cloud-offline-outline" tint={colors.danger} {...props} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerSide: { minWidth: HIT, flexDirection: 'row', gap: spacing.sm },
  headerRight: { justifyContent: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center' },
  button: { minHeight: 52, borderRadius: radii.md, overflow: 'hidden' },
  buttonGhost: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  buttonFill: { flex: 1, minHeight: 52, justifyContent: 'center', paddingHorizontal: spacing.xl },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonPlain: { backgroundColor: 'transparent', borderWidth: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardAccent: { borderColor: 'rgba(233,180,76,0.45)', backgroundColor: '#161407' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    minHeight: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 60, paddingVertical: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
});
