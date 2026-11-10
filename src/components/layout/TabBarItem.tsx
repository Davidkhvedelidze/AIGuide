import { Pressable, Text, View } from 'react-native';
import { premiumTheme } from '@/lib/constants/theme';

export type PremiumTabKey = 'guide' | 'history' | 'map' | 'profile';

interface TabBarItemProps {
  tabKey: PremiumTabKey;
  label: string;
  isActive: boolean;
  onPress: (tab: PremiumTabKey) => void;
}

function TabIcon({ tabKey, color }: { tabKey: PremiumTabKey; color: string }) {
  if (tabKey === 'guide') {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-lg border" style={{ borderColor: color }}>
        <View className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: color }} />
      </View>
    );
  }

  if (tabKey === 'history') {
    return (
      <View className="h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: color }}>
        <View className="absolute h-2.5 w-px" style={{ backgroundColor: color, transform: [{ translateY: -2 }] }} />
        <View className="absolute h-px w-2.5" style={{ backgroundColor: color, transform: [{ translateX: 2 }] }} />
      </View>
    );
  }

  if (tabKey === 'map') {
    return (
      <View className="h-6 w-6 items-center justify-center">
        <View className="h-5 w-5 rounded-full border" style={{ borderColor: color }} />
        <View className="absolute h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </View>
    );
  }

  return (
    <View className="h-6 w-6 items-center">
      <View className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: color }} />
      <View className="mt-1 h-3.5 w-5 rounded-t-full border" style={{ borderBottomWidth: 0, borderColor: color }} />
    </View>
  );
}

export function TabBarItem({ tabKey, label, isActive, onPress }: TabBarItemProps) {
  const color = isActive ? premiumTheme.colors.goldLight : premiumTheme.colors.textMuted;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      className="min-h-14 flex-1 items-center justify-center gap-1 rounded-2xl px-2"
      hitSlop={8}
      onPress={() => onPress(tabKey)}
      style={{ backgroundColor: isActive ? 'rgba(217,169,78,0.10)' : 'transparent' }}
    >
      <TabIcon color={color} tabKey={tabKey} />
      <Text className="text-[11px] font-semibold" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}
