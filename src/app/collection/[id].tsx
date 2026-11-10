import { router, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, Platform, StyleSheet, View } from 'react-native';

import { PlaceRow } from '@/components/place';
import { EmptyState, Header, IconButton, Screen } from '@/components/ui';
import { usePlaces } from '@/data/queries';
import type { Place } from '@/data/types';
import { useT } from '@/i18n';
import { useLibrary } from '@/store/library';
import { spacing } from '@/theme/tokens';

export default function CollectionScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collection = useLibrary((s) => s.collections.find((c) => c.id === id));
  const deleteCollection = useLibrary((s) => s.deleteCollection);
  const { data: places } = usePlaces();

  if (!collection) {
    return (
      <Screen>
        <Header />
        <EmptyState title={t('saved.collectionEmpty')} />
      </Screen>
    );
  }

  const items = collection.placeIds.map((pid) => places?.find((p) => p.id === pid)).filter((p): p is Place => !!p);

  const remove = () => {
    deleteCollection(collection.id);
    router.back();
  };

  const confirmDelete = () => {
    // Deleting a collection keeps the places saved; only the grouping is removed.
    if (Platform.OS === 'web') return remove();
    Alert.alert(t('saved.deleteCollection'), collection.name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={collection.name} right={<IconButton icon="trash-outline" label={t('saved.deleteCollection')} onPress={confirmDelete} />} />
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="folder-open-outline" title={t('saved.collectionEmpty')} message={t('saved.collectionEmptyBody')} />}
        renderItem={({ item }) => <PlaceRow place={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
});
