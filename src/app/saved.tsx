import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { PlaceRow } from '@/components/place';
import { Card, EmptyState, Header, IconButton, ListRow, Screen, SectionHeader, SkeletonList } from '@/components/ui';
import { usePlaces } from '@/data/queries';
import type { Place } from '@/data/types';
import { useT } from '@/i18n';
import { useLibrary } from '@/store/library';
import { colors, radii, spacing, type } from '@/theme/tokens';

export default function SavedScreen() {
  const t = useT();
  const { data: places, isLoading } = usePlaces();
  const savedIds = useLibrary((s) => s.savedIds);
  const collections = useLibrary((s) => s.collections);
  const createCollection = useLibrary((s) => s.createCollection);
  const [name, setName] = useState('');

  const saved = savedIds.map((id) => places?.find((p) => p.id === id)).filter((p): p is Place => !!p);

  const create = () => {
    if (createCollection(name)) setName('');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t('saved.title')} />
      {isLoading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <SectionHeader title={t('saved.collections')} />
              <View style={styles.newRow}>
                <TextInput
                  testID="collection-name"
                  accessibilityLabel={t('saved.name')}
                  placeholder={t('saved.name')}
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  maxLength={40}
                  onChangeText={setName}
                  onSubmitEditing={create}
                  returnKeyType="done"
                  style={styles.input}
                />
                <IconButton testID="collection-create" icon="add" label={t('saved.new')} onPress={create} size={52} />
              </View>
              {collections.length > 0 && (
                <Card style={styles.collections}>
                  {collections.map((c) => (
                    <ListRow
                      key={c.id}
                      icon="folder-outline"
                      title={c.name}
                      subtitle={t('saved.count', { n: c.placeIds.length })}
                      onPress={() => router.push({ pathname: '/collection/[id]', params: { id: c.id } })}
                    />
                  ))}
                </Card>
              )}
              <SectionHeader title={t('saved.places')} />
            </View>
          }
          ListEmptyComponent={<EmptyState icon="bookmark-outline" title={t('saved.emptyTitle')} message={t('saved.emptyBody')} />}
          renderItem={({ item }) => <PlaceRow place={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  newRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    ...type.body,
    flex: 1,
    color: colors.text,
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  collections: { marginTop: spacing.md, paddingVertical: spacing.xs },
});
