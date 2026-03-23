import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function FoldersScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {t('tabs.folders')}
      </Text>
    </View>
  );
}
