import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Mic, Sparkles, FolderOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', icon: Mic, titleKey: 'onboarding.slide1.title', descKey: 'onboarding.slide1.desc' },
  { id: '2', icon: Sparkles, titleKey: 'onboarding.slide2.title', descKey: 'onboarding.slide2.desc' },
  { id: '3', icon: FolderOpen, titleKey: 'onboarding.slide3.title', descKey: 'onboarding.slide3.desc' },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@onboarding_complete', 'true');
    router.replace('/(auth)/login');
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <View className="flex-1 bg-indigo-900">
      <View className="absolute inset-0" style={{ backgroundColor: '#312e81' }} />
      
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const Icon = item.icon;
          return (
            <View style={{ width }} className="flex-1 items-center justify-center p-8">
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Icon size={120} color="#06B6D4" strokeWidth={1.5} />
              </Animated.View>
              <Animated.Text entering={FadeInDown.delay(300)} className="text-3xl font-bold text-white mt-8 mb-4 text-center">
                {t(item.titleKey)}
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(400)} className="text-lg text-indigo-100 text-center">
                {t(item.descKey)}
              </Animated.Text>
            </View>
          );
        }}
        keyExtractor={item => item.id}
      />

      <View className="p-8 pb-12 flex-row justify-between items-center w-full absolute bottom-0">
        <View className="flex-row gap-2">
          {slides.map((_, i) => (
            <View key={i} className={`h-2 rounded-full ${i === currentIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-indigo-300'}`} />
          ))}
        </View>
        
        <TouchableOpacity 
          onPress={nextSlide}
          className="bg-white px-6 py-3 rounded-full"
        >
          <Text className="text-indigo-900 font-bold text-lg">
            {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
