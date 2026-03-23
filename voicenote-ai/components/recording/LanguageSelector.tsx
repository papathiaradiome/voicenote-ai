import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { useRecordingStore } from '../../stores/recordingStore';

const LANGUAGES = [
  { code: 'fr-FR', name: 'Français', emoji: '🇫🇷' },
  { code: 'en-US', name: 'Anglais', emoji: '🇺🇸' },
  { code: 'es-ES', name: 'Espagnol', emoji: '🇪🇸' },
  { code: 'de-DE', name: 'Allemand', emoji: '🇩🇪' },
  { code: 'it-IT', name: 'Italien', emoji: '🇮🇹' },
  { code: 'pt-BR', name: 'Portugais', emoji: '🇧🇷' },
  { code: 'ar-SA', name: 'Arabe', emoji: '🇸🇦' },
  { code: 'zh-CN', name: 'Chinois', emoji: '🇨🇳' },
  { code: 'ja-JP', name: 'Japonais', emoji: '🇯🇵' },
  { code: 'ko-KR', name: 'Coréen', emoji: '🇰🇷' },
  { code: 'ru-RU', name: 'Russe', emoji: '🇷🇺' },
  { code: 'hi-IN', name: 'Hindi', emoji: '🇮🇳' },
  { code: 'tr-TR', name: 'Turc', emoji: '🇹🇷' },
  { code: 'nl-NL', name: 'Néerlandais', emoji: '🇳🇱' },
  { code: 'pl-PL', name: 'Polonais', emoji: '🇵🇱' },
  { code: 'sv-SE', name: 'Suédois', emoji: '🇸🇪' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useRecordingStore();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selected = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const filtered = LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <TouchableOpacity 
        onPress={() => setVisible(true)}
        className="flex-row items-center bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700"
      >
        <Text className="text-base mr-2">{selected.emoji}</Text>
        <Text className="text-white font-medium mr-1">{selected.name}</Text>
        <ChevronDown size={14} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-slate-900 rounded-t-3xl h-[70%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Langue de transcription</Text>
              <TouchableOpacity onPress={() => setVisible(false)} className="bg-slate-800 p-2 rounded-full">
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-800 p-3 rounded-xl mb-4 border border-slate-700">
              <Search size={20} color="#94A3B8" className="mr-2" />
              <TextInput 
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher une langue..."
                placeholderTextColor="#94A3B8"
                className="flex-1 text-white"
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => { setLanguage(item.code); setVisible(false); }}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${language === item.code ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <Text className="text-2xl mr-4">{item.emoji}</Text>
                  <Text className={`font-medium ${language === item.code ? 'text-white' : 'text-slate-300'}`}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
