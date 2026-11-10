import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button, Header, Screen, Text } from '@/components/ui';
import { supabase } from '@/data/supabase';
import { useT } from '@/i18n';
import { colors, radii, spacing, type } from '@/theme/tokens';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email one-time code sign-in. No passwords are stored or typed in the app. */
export default function SignIn() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendCode = async () => {
    if (!EMAIL.test(email.trim())) return setMessage(t('signIn.invalid'));
    if (!supabase) return setMessage(t('signIn.unavailable'));
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setMessage(t('common.errorBody'));
    setMessage(t('signIn.sent'));
    setStep('code');
  };

  const verify = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) return setMessage(t('signIn.badCode'));
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <Text variant="title" accessibilityRole="header">
          {t('signIn.title')}
        </Text>
        <Text color="textSecondary">{t('signIn.body')}</Text>

        {step === 'email' ? (
          <TextInput
            testID="email-input"
            accessibilityLabel={t('signIn.email')}
            placeholder={t('signIn.email')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        ) : (
          <TextInput
            testID="code-input"
            accessibilityLabel={t('signIn.code')}
            placeholder={t('signIn.code')}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            style={styles.input}
          />
        )}

        {message && (
          <Text variant="caption" color="textSecondary" accessibilityLiveRegion="polite">
            {message}
          </Text>
        )}

        <View style={styles.actions}>
          {step === 'email' ? (
            <Button title={t('signIn.send')} loading={busy} onPress={sendCode} />
          ) : (
            <Button title={t('signIn.verify')} loading={busy} disabled={code.trim().length < 6} onPress={verify} />
          )}
          <Button title={t('signIn.guest')} variant="ghost" onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.xl, gap: spacing.md },
  input: {
    ...type.body,
    color: colors.text,
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  actions: { gap: spacing.md, marginTop: spacing.lg },
});
