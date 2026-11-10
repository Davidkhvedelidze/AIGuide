import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { premiumTheme } from '@/lib/constants/theme';
import { TabBarItem, type PremiumTabKey } from './TabBarItem';

interface BottomTabNavigationProps {
  activeTab: PremiumTabKey;
  onTabPress: (tab: PremiumTabKey) => void;
  className?: string;
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
}

const tabs: { key: PremiumTabKey; label: string }[] = [
  { key: 'guide', label: 'Guide' },
  { key: 'history', label: 'History' },
  { key: 'map', label: 'Map' },
  { key: 'profile', label: 'Profile' },
];

export function BottomTabNavigation({ activeTab, onTabPress, className, floating = true, style }: BottomTabNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`${floating ? 'absolute inset-x-4 bottom-0' : ''} border-t px-3 pt-3 ${className ?? ''}`}
      style={[
        {
          backgroundColor: premiumTheme.colors.tabBar,
          borderColor: premiumTheme.colors.border,
          borderTopLeftRadius: premiumTheme.radii.xl,
          borderTopRightRadius: premiumTheme.radii.xl,
          minHeight: premiumTheme.spacing.bottomTabHeight + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, 12),
          ...premiumTheme.shadows.glass,
        },
        style,
      ]}
    >
      <View className="flex-row items-center justify-between gap-1">
        {tabs.map((tab) => (
          <TabBarItem key={tab.key} isActive={activeTab === tab.key} label={tab.label} onPress={onTabPress} tabKey={tab.key} />
        ))}
      </View>
    </View>
  );
}

export type { PremiumTabKey };
