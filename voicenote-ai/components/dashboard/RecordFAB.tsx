import React, { useEffect } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export const RecordFAB = () => {
  const scale = useSharedValue(1);
  const router = useRouter();

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Simulation du routing vers l'enregistrement
    console.log("Navigating to record screen...");
    // router.push('/record');
  };

  return (
    <Animated.View style={[animatedStyle, { position: 'absolute', bottom: 24, right: 24, zIndex: 50 }]}>
      <TouchableOpacity 
        onPress={handlePress}
        className="w-16 h-16 bg-indigo-500 rounded-full items-center justify-center shadow-lg shadow-indigo-500/50 elevation-5"
        activeOpacity={0.8}
      >
        <Mic size={28} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};
