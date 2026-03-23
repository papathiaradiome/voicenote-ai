---
name: VoiceNote Design System
description: Activé quand on travaille sur l'UI, le styling, les couleurs, la typographie ou les composants visuels de VoiceNote AI
---
# VoiceNote Design System

## Couleurs principales
- Primary: #6366F1 (Indigo)
- Secondary: #8B5CF6 (Violet)
- Accent: #06B6D4 (Cyan)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

## Backgrounds
- Light: #F8FAFC
- Dark: #0F172A
- Surface Dark: #1E293B
- Card Dark: #334155

## Textes Dark mode
- primary: #F1F5F9
- secondary: #94A3B8
- border: #475569

## Typographie
- Inter Bold pour les titres
- Inter Regular pour le corps

## Éléments d'interface
- Border-radius : 16px sur les cards, 12px sur les boutons, 24px sur les badges
- Ombres subtiles sur les cards (shadow-sm en light, pas d'ombre en dark)
- Tab bar : fond flottant arrondi, surélevé, avec blur
- Boutons : full-width par défaut, hauteur 48px, texte centré bold
- Inputs : hauteur 48px, border 1px gris, focus border indigo
- Cards : padding 16px, gap 12px entre éléments internes

## Comportements
- Tous les composants DOIVENT supporter le thème clair ET sombre
- Animations : transitions 200ms ease, feedback haptique sur les actions importantes
- Empty states : illustration + texte + bouton d'action
- Loading states : skeleton loaders (pas de spinners sauf cas spéciaux)
