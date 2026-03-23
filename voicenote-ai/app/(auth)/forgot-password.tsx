import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async () => {
    const { error } = await resetPassword(email);
    if (!error) setSuccess(true);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 py-12">
      <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-4 mt-12">{t('auth.forgotPassword')}</Text>
      
      {success ? (
        <View>
          <Text className="text-emerald-600 dark:text-emerald-400 font-bold mb-6">{t('auth.resetLinkSent')}</Text>
          <Link href="/(auth)/login" asChild>
            <Button title={t('auth.backToLogin')} onPress={() => {}} />
          </Link>
        </View>
      ) : (
        <View className="gap-4">
          <Input label={t('auth.email')} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Button title={t('auth.sendResetLink')} onPress={onSubmit} isLoading={isLoading} />
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="items-center mt-4">
              <Text className="text-indigo-500 font-bold">{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  );
}
