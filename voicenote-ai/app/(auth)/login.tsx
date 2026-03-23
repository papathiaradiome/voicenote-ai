import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mic, Eye, EyeOff } from 'lucide-react-native';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signInWithApple, signInWithMagicLink, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    const { error } = await signInWithEmail(data.email, data.password);
    if (error) setErrorMsg(error.message || t('auth.loginError'));
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 py-12">
      <View className="items-center mt-12 mb-8">
        <View className="bg-indigo-500 w-16 h-16 rounded-2xl items-center justify-center mb-4">
          <Mic color="white" size={32} />
        </View>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">VoiceNote AI</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input 
              label={t('auth.email')} 
              placeholder="email@example.com" 
              autoCapitalize="none"
              keyboardType="email-address"
              value={value} 
              onChangeText={onChange} 
              error={errors.email?.message} 
            />
          )}
        />
        
        <View className="relative">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input 
                label={t('auth.password')} 
                placeholder="********" 
                secureTextEntry={!showPassword}
                value={value} 
                onChangeText={onChange} 
                error={errors.password?.message} 
              />
            )}
          />
          <TouchableOpacity 
            className="absolute right-4 top-10" 
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}
          </TouchableOpacity>
        </View>

        <Button 
          title={t('auth.signIn')} 
          onPress={handleSubmit(onSubmit)} 
          isLoading={isLoading} 
          className="mt-2"
        />
        
        <View className="flex-row items-center justify-between mt-2">
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity><Text className="text-indigo-500 font-bold">{t('auth.forgotPassword')}</Text></TouchableOpacity>
          </Link>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity><Text className="text-indigo-500 font-bold">{t('auth.noAccount')}</Text></TouchableOpacity>
          </Link>
        </View>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
          <Text className="mx-4 text-slate-500">— {t('auth.or')} —</Text>
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
        </View>

        <Button title={t('auth.continueGoogle')} variant="outline" onPress={signInWithGoogle} />
        <Button title={t('auth.continueApple')} variant="outline" onPress={signInWithApple} />
        <Button title={t('auth.magicLink')} variant="ghost" onPress={() => signInWithMagicLink('demo@example.com')} />
      </View>

      {errorMsg ? <Toast message={errorMsg} type="error" /> : null}
      <View className="h-10" />
    </ScrollView>
  );
}
