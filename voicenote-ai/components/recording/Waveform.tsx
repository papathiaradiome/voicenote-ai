import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useRecordingStore } from '../../stores/recordingStore';

const BAR_COUNT = 40;

export const Waveform = () => {
  const { currentMetering, isRecording, isPaused } = useRecordingStore();
  
  // Array of shared values for the generic bars
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bars = Array.from({ length: BAR_COUNT }).map(() => useSharedValue(5));

  useEffect(() => {
    if (!isRecording || isPaused) {
      bars.forEach(bar => {
        bar.value = withTiming(5, { duration: 300 });
      });
      return;
    }

    // Convert metering (-160 to 0) to a height multiplier
    const normalizedMetering = Math.max(0, (currentMetering + 160) / 160); // 0 to 1
    const baseHeight = normalizedMetering * 80 + 5; // 5 to 85

    bars.forEach((bar) => {
      // Randomize height around baseHeight to simulate real waves
      const randomFactor = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
      const targetHeight = baseHeight * randomFactor;
      bar.value = withSpring(Math.max(5, targetHeight), { damping: 10, stiffness: 100 });
    });
  }, [currentMetering, isRecording, isPaused]);

  return (
    <View className="flex-row items-center justify-center h-32 gap-1 overflow-hidden px-4">
      {bars.map((bar, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          height: bar.value,
        }));
        
        // Gradient simulation: center is cyan, edges are indigo
        const distanceFromCenter = Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT / 2);
        const backgroundColor = distanceFromCenter < 0.3 ? '#06B6D4' : (distanceFromCenter < 0.7 ? '#6366F1' : '#4F46E5');

        return (
          <Animated.View
            key={index}
            style={[
              { width: 4, backgroundColor, borderRadius: 2 },
              animatedStyle
            ]}
          />
        );
      })}
    </View>
  );
};
