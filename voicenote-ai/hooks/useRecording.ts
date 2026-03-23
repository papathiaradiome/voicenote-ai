import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { useRecordingStore } from '../stores/recordingStore';
import { Alert } from 'react-native';

export const useRecording = () => {
  const store = useRecordingStore();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) recording.stopAndUnloadAsync();
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert("Permission requise", "Veuillez autoriser l'accès au microphone.");
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      store.resetRecording();

      const { recording: newRecording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      setRecording(newRecording);
      store.setIsRecording(true);
      store.setIsPaused(false);

      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          store.setDuration(status.durationMillis);
          store.setCurrentMetering(status.metering || -160);
        }
      });

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    await recording.pauseAsync();
    store.setIsPaused(true);
  };

  const resumeRecording = async () => {
    if (!recording) return;
    await recording.startAsync();
    store.setIsPaused(false);
  };

  const stopRecording = async () => {
    if (!recording) return null;
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      const uri = recording.getURI();
      store.setAudioUri(uri);
      store.setIsRecording(false);
      store.setIsPaused(false);
      
      setRecording(null);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording', error);
      return null;
    }
  };

  return {
    ...store,
    hasPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  };
};
