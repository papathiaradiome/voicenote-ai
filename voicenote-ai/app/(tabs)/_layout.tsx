import { Tabs } from 'expo-router';
import { Home, Search, FolderOpen, Calendar, User } from 'lucide-react-native';
import { useUiStore } from '../../stores/uiStore';
import { COLORS } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const theme = useUiStore(state => state.theme);
  const { t } = useTranslation();
  const isDark = theme === 'dark'; // Ou logique système plus poussée

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          elevation: 0,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 30,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          title: t('tabs.home')
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          title: t('tabs.search')
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          tabBarIcon: ({ color }) => <FolderOpen color={color} size={24} />,
          title: t('tabs.folders')
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
          title: t('tabs.calendar')
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          title: t('tabs.profile')
        }}
      />
    </Tabs>
  );
}
