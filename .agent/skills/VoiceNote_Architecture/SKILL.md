---
name: VoiceNote Architecture
description: Activé quand on crée des fichiers, des stores, des hooks ou qu'on structure le code de VoiceNote AI
---
# VoiceNote Architecture

## Stack / Technologies
- Stack : React Native + Expo (dernière version stable) + TypeScript strict
- Navigation : expo-router (file-based routing)
- State : Zustand (un store par domaine : auth, notes, folders, recording, ui)
- Backend : Supabase (auth, postgres, storage, edge functions, realtime)
- Styling : NativeWind (TailwindCSS)
- Animations : react-native-reanimated
- Icônes : lucide-react-native
- Formulaires : react-hook-form + zod

## Structure de dossiers
- app/ → écrans (expo-router)
- components/ → composants réutilisables, sous-dossier ui/ pour les primitives
- hooks/ → custom hooks, un hook wrapper par store
- stores/ → Zustand stores
- services/ → un fichier par API externe (supabase.ts, openai.ts, deepgram.ts, revenueCat.ts, calendar.ts, youtube.ts)
- utils/ → fonctions pures (constants.ts, formatters.ts)
- types/ → index.ts avec tous les types
- i18n/ → un fichier JSON par langue
- supabase/functions/ → Edge Functions Deno

## Conventions
- Composants fonctionnels uniquement
- PascalCase pour composants, camelCase pour hooks/utils/services
- Aucun « any » TypeScript autorisé
- Tous les textes UI doivent utiliser i18next
- Commentaires en français
- Chaque écran gère 4 états d'UI de façon stricte : loading (skeleton), error (message + retry), empty (illustration + CTA), success (données)
