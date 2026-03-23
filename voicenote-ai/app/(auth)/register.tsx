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

// Validation stricte
const registerSchema = z.object({
  name: z.string().min(2, '2 caractères minimum'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum').regex(/[A-Z]/, 'Une majuscule requise').regex(/[0-9]/, 'Un chiffre requis'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, { message: 'Vous devez accepter les conditions' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUpWithEmail, isLoading } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false }
  });

  const pwd = watch('password', '');
  const terms = watch('acceptTerms');
  
  // Password strength logic
  let strengthScore = 0;
  if (pwd.length >= 8) strengthScore++;
  if (/[A-Z]/.test(pwd)) strengthScore++;
  if (/[0-9]/.test(pwd)) strengthScore++;
  
  let strengthColor = 'bg-slate-200 dark:bg-slate-700';
  if (pwd.length > 0) {
    if (strengthScore <= 1) strengthColor = 'bg-red-500';
    else if (strengthScore === 2) strengthColor = 'bg-amber-500';
    else strengthColor = 'bg-emerald-500';
  }

  const onSubmit = async (data: RegisterForm) => {
    setErrorMsg('');
    const { error } = await signUpWithEmail(data.email, data.password, data.name);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(t('auth.checkEmail'));
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 py-12">
      <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-8 mt-12">{t('auth.createAccount')}</Text>

      <View className="gap-4">
        <Controller
          control={control} name="name"
          render={({ field: { onChange, value } }) => (
            <Input label={t('auth.fullName')} value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control} name="email"
          render={({ field: { onChange, value } }) => (
            <Input label={t('auth.email')} autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} error={errors.email?.message} />
          )}
        />
        <View>
          <Controller
            control={control} name="password"
            render={({ field: { onChange, value } }) => (
              <Input label={t('auth.password')} secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} />
            )}
          />
          {/* Password Strength Bar */}
          <View className="flex-row h-1 mt-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            <View className={`h-full ${strengthColor}`} style={{ width: `${(strengthScore/3)*100}%` }} />
          </View>
        </View>

        <Controller
          control={control} name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input label={t('auth.confirmPassword')} secureTextEntry value={value} onChangeText={onChange} error={errors.confirmPassword?.message} />
          )}
        />

        <TouchableOpacity onPress={() => setValue('acceptTerms', !terms)} className="flex-row items-center mt-2">
          <View className={`w-5 h-5 rounded border ${terms ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400 dark:border-slate-600'} mr-3 items-center justify-center`}>
            {terms && <View className="w-2 h-2 bg-white rounded-sm" />}
          </View>
          <Text className="text-slate-600 dark:text-slate-400 shrink">{t('auth.acceptTerms')}</Text>
        </TouchableOpacity>
        {errors.acceptTerms && <Text className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</Text>}

        <Button title={t('auth.registerButton')} onPress={handleSubmit(onSubmit)} isLoading={isLoading} className="mt-4" />
        
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="items-center mt-4">
            <Text className="text-indigo-500 font-bold">{t('auth.alreadyHaveAccount')}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {errorMsg ? <Toast message={errorMsg} type="error" /> : null}
      {successMsg ? <Toast message={successMsg} type="success" /> : null}
      <View className="h-20" />
    </ScrollView>
  );
}
