import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Card, Chip, EmptyState, ErrorState, Header, IconButton, ListRow, Screen, SectionHeader, Skeleton, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';

/** Every design-system component in every state, for quick visual checks. */
export default function ComponentGallery() {
  const [selected, setSelected] = useState(true);
  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Components" right={<IconButton icon="share-outline" label="Share" />} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <SectionHeader title="Typography" />
        <Text variant="display">Display</Text>
        <Text variant="title">Title</Text>
        <Text variant="heading">Heading</Text>
        <Text>Body text on the base surface.</Text>
        <Text color="textSecondary">Secondary text</Text>
        <Text variant="caption" color="textMuted">
          Muted caption
        </Text>

        <SectionHeader title="Buttons" action="See all" />
        <Button title="Primary" icon="play" />
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <Button title="Ghost" variant="ghost" icon="refresh" />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <IconButton icon="chevron-back" label="Back" />
          <IconButton icon="bookmark" label="Saved" active />
          <IconButton icon="locate" label="Locate" plain />
        </View>

        <SectionHeader title="Chips" />
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Chip label="Selectable" selected={selected} onPress={() => setSelected(!selected)} />
          <Chip label="With icon" icon="calendar-outline" />
          <Chip label="Plain" />
        </View>

        <SectionHeader title="Cards and rows" />
        <Card>
          <ListRow icon="settings-outline" title="Row with chevron" subtitle="Subtitle text" onPress={() => undefined} />
          <ListRow icon="information-circle-outline" title="Static row" />
        </Card>
        <Card accent>
          <Text variant="bodyStrong">Accent card</Text>
        </Card>

        <SectionHeader title="States" />
        <Skeleton height={72} />
        <View style={{ height: 260 }}>
          <EmptyState title="Empty state" message="Nothing to show yet." action="Do something" />
        </View>
        <View style={{ height: 260 }}>
          <ErrorState title="Error state" message="Check your connection." action="Try again" />
        </View>
      </ScrollView>
    </Screen>
  );
}
