import { Pressable, ScrollView, Text } from 'react-native';
import type { CategoryFilterOption, NearbyCategoryFilter } from '@/features/landmarks/hooks/useNearbyLandmarks';

interface CategoryFilterProps {
  options: CategoryFilterOption[];
  selectedCategory: NearbyCategoryFilter;
  onSelectCategory: (category: NearbyCategoryFilter) => void;
}

export function CategoryFilter({ options, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <ScrollView
      accessibilityLabel="Nearby place categories"
      className="-mx-5"
      contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedCategory;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={`min-h-11 justify-center rounded-full border px-4 ${
              isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-200 bg-white'
            }`}
            hitSlop={8}
            key={option.value}
            onPress={() => onSelectCategory(option.value)}
          >
            <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
