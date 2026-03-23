import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ChevronLeft, Play, Pause, Bookmark as BookmarkIcon, UploadCloud } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRecording } from '../hooks/useRecording';
import { Waveform } from '../components/recording/Waveform';
import { LanguageSelector } from '../components/recording/LanguageSelector';
import { supabase } from '../services/supabase';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';

export default function RecordingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { 
    isRecording, isPaused, duration, currentMetering, bookmarks, 
    startRecording, pauseRecording, resumeRecording, stopRecording, 
    addBookmark, audioUri, resetRecording, language,
    addPendingUpload
  } = useRecording();
  
  const [title, setTitle] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const localeObj = i18n.language === 'fr' ? fr : enUS;
    setTitle(`Nouvelle note - ${format(new Date(), 'd MMM yyyy', { locale: localeObj })}`);
    
    setTimeout(() => {
      startRecording();
    }, 500);
    
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await stopRecording();
    setShowSummary(true);
  };

  const handleCancel = () => {
    if (isRecording || audioUri) {
      Alert.alert(
        "Voulez-vous vraiment annuler ?",
        "L'enregistrement sera perdu.",
        [
          { text: "Non", style: "cancel" },
          { 
            text: "Oui, annuler", 
            style: "destructive", 
            onPress: () => {
              if (isRecording) stopRecording();
              resetRecording();
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePauseResume = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPaused) {
      await resumeRecording();
    } else {
      await pauseRecording();
    }
  };

  const handleAddBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addBookmark(duration);
  };

  const playPreview = async () => {
    if (!audioUri) return;
    try {
      if (isPlaying) {
        await sound?.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!sound) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true }
          );
          setSound(newSound);
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
          });
          await newSound.playAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Playback error', error);
    }
  };

  const handleSave = async () => {
    if (!audioUri) return;
    setIsSaving(true);
    try {
      const netInfo = await NetInfo.fetch();
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!netInfo.isConnected && userId) {
        addPendingUpload({
          id: Date.now().toString(),
          uri: audioUri,
          title,
          duration: Math.floor(duration / 1000),
          language,
          bookmarks,
          createdAt: new Date().toISOString()
        });
        Alert.alert("Mode hors-ligne", "L'enregistrement a été sauvegardé en local. Il sera synchronisé dès le retour de la connexion.");
        resetRecording();
        router.replace(`/(tabs)` as any);
        return;
      }
      
      if (userId) {
        const fileName = `${userId}/${Date.now()}.m4a`;
        
        const { error } = await supabase.from('notes').insert({
          user_id: userId,
          title: title,
          audio_url: fileName,
          duration: Math.floor(duration / 1000),
          transcription_status: 'pending',
          is_favorite: false
        });

        if (!error) {
          supabase.functions.invoke('transcribe', { body: { fileName, language } }).catch(console.error);
          resetRecording();
          router.replace(`/(tabs)` as any);
        } else {
          throw new Error("Erreur BDD");
        }
      }
    } catch (e) {
      addPendingUpload({
        id: Date.now().toString(),
        uri: audioUri,
        title,
        duration: Math.floor(duration / 1000),
        language,
        bookmarks,
        createdAt: new Date().toISOString()
      });
      Alert.alert("Erreur", "L'enregistrement a été sauvegardé en local.");
      resetRecording();
      router.replace(`/(tabs)` as any);
    } finally {
      setIsSaving(false);
    }
  };

  if (showSummary) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="p-6 pt-12 flex-1 items-center justify-center">
          <View className="bg-slate-900 w-full p-8 rounded-3xl border border-slate-800 items-center">
            <Text className="text-white text-2xl font-bold text-center mb-2">{title}</Text>
            <Text className="text-slate-400 text-lg mb-8">{formatTime(duration)}</Text>

            <View className="w-full gap-4">
              <TouchableOpacity onPress={playPreview} className="bg-slate-800 flex-row items-center justify-center py-4 rounded-2xl">
                {isPlaying ? <Pause color="white" className="mr-2" /> : <Play color="white" className="mr-2" />}
                <Text className="text-white font-bold text-lg">{isPlaying ? "Pause" : "Réécouter"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSave} disabled={isSaving} className="bg-indigo-600 flex-row items-center justify-center py-4 rounded-2xl">
                <UploadCloud color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">{isSaving ? "Sauvegarde..." : "Sauvegarder"}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleCancel} className="mt-4 py-2">
                <Text className="text-red-400 text-center font-semibold">Supprimer l'enregistrement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-row justify-between items-center px-4 py-4 mt-8">
        <TouchableOpacity onPress={handleCancel} className="w-10 h-10 items-center justify-center bg-slate-900 rounded-full">
          <ChevronLeft color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold">Enregistrement</Text>
        <LanguageSelector />
      </View>

      <View className="px-6 mt-8 items-center">
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="text-white text-2xl font-bold text-center bg-slate-900/50 px-4 py-2 rounded-xl w-full border border-slate-800"
          placeholderTextColor="#64748B"
        />
      </View>

      <View className="flex-1 items-center justify-center mt-8">
        <View className="items-center mb-12">
          <View className="flex-row items-center mb-2">
            <View className={`w-3 h-3 rounded-full mr-2 ${isRecording && !isPaused ? 'bg-red-500' : 'bg-slate-600'}`} />
            <Text className={`font-bold tracking-wider ${isRecording && !isPaused ? 'text-red-500' : 'text-slate-500'}`}>
              {isPaused ? 'PAUSE' : 'REC'}
            </Text>
          </View>
          <Text className="text-white text-7xl tracking-tighter" style={{ fontFamily: 'monospace' }}>
            {formatTime(duration)}
          </Text>
        </View>

        <View className="w-full">
          <Waveform />
        </View>

        <View className="mt-8 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <Text className={`font-medium ${currentMetering > -40 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentMetering > -40 ? 'Bon signal' : 'Signal faible'}
          </Text>
        </View>
      </View>

      <View className="h-32 px-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start' }}>
          {bookmarks.map((bm, idx) => (
            <View key={idx} className="bg-slate-800 px-3 py-1.5 rounded-lg flex-row items-center mr-2">
              <BookmarkIcon size={14} color="#06B6D4" className="mr-1" />
              <Text className="text-slate-300 text-xs">{formatTime(bm.time)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-row items-center justify-center gap-8 mb-12">
        <TouchableOpacity 
          onPress={handlePauseResume}
          className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
        >
          {isPaused ? <Play color="white" size={24} /> : <Pause color="white" size={24} fill="white" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleStop}
          className="w-20 h-20 rounded-full border-4 border-slate-800 items-center justify-center"
        >
          <View className="w-10 h-10 bg-red-500 rounded-lg" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleAddBookmark}
          className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
        >
          <BookmarkIcon color="white" size={24} />
          {bookmarks.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-cyan-500 w-5 h-5 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{bookmarks.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
