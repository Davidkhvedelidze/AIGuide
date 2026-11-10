import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Header, Screen, Text } from '@/components/ui';
import { useT, type StringKey } from '@/i18n';
import { track } from '@/services/analytics';
import { purchases, type PlanId } from '@/services/purchases';
import { colors, radii, spacing } from '@/theme/tokens';

const BENEFITS: StringKey[] = ['paywall.b1', 'paywall.b2', 'paywall.b3'];
const LABEL: Record<PlanId, StringKey> = { monthly: 'paywall.monthly', yearly: 'paywall.yearly' };

export default function PaywallScreen() {
  const t = useT();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data: plans = [] } = useQuery({ queryKey: ['plans'], queryFn: () => purchases.getPlans() });

  useEffect(() => {
    track('paywall_viewed');
  }, []);

  const run = async (action: () => Promise<boolean>) => {
    setBusy(true);
    setFailed(false);
    try {
      if (await action()) router.back();
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.crown}>
          <Ionicons name="star" size={36} color={colors.gold} />
        </View>
        <Text variant="display" center accessibilityRole="header">
          {t('paywall.title')}
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map((key) => (
            <View key={key} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={20} color={colors.gold} />
              <Text style={{ flex: 1 }}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans} accessibilityRole="radiogroup">
          {plans.map((p) => {
            const selected = p.id === plan;
            return (
              <Pressable
                key={p.id}
                testID={`plan-${p.id}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t(LABEL[p.id])}${p.price ? `, ${p.price}` : ''}`}
                onPress={() => setPlan(p.id)}
                style={[styles.plan, selected && styles.planSelected]}>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.gold : colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t(LABEL[p.id])}</Text>
                  {p.id === 'yearly' && (
                    <Text variant="caption" color="gold">
                      {t('paywall.best')}
                    </Text>
                  )}
                </View>
                {p.price && <Text variant="bodyStrong">{p.price}</Text>}
              </Pressable>
            );
          })}
        </View>

        {!purchases.live && (
          <Text variant="caption" color="textMuted" center>
            {t('paywall.demo')}
          </Text>
        )}
        {failed && (
          <Text variant="caption" color="danger" center accessibilityLiveRegion="polite">
            {t('paywall.unavailable')}
          </Text>
        )}

        <Button testID="paywall-continue" title={t('paywall.continue')} loading={busy} onPress={() => run(() => purchases.purchase(plan))} />
        <Button title={t('paywall.restore')} variant="ghost" disabled={busy} onPress={() => run(() => purchases.restore())} />
        <Text variant="caption" color="textMuted" center>
          {t('paywall.legal')}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  crown: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
  },
  benefits: { gap: spacing.md, marginVertical: spacing.sm },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  plans: { gap: spacing.sm },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planSelected: { borderColor: colors.gold },
});
