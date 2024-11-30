# Maquette Fil de Fer - SunSpot

## Vue Principale (Home)

```
┌─────────────────────────────────────┐
│ ⚡ SunSpot            ⚙️ Settings   │ <- Header avec titre et bouton paramètres
├─────────────────────────────────────┤
│   🌤️ 22°C - Partiellement nuageux   │ <- Barre météo actuelle
├─────────────────────────────────────┤
│                                     │
│                                     │
│                                     │
│            CARTE LEAFLET            │ <- Carte principale
│          (Vue par défaut)           │
│                                     │
│             [📍]                    │ <- Position utilisateur
│                                     │
│                                     │
├─────────────────────────────────────┤
│ 🌞 Spot ensoleillé le plus proche:  │ <- Info spot
│ Parc des Buttes-Chaumont (2.3 km)   │
│ [▶️ Y ALLER]                        │ <- Bouton navigation
└─────────────────────────────────────┘

## Légende de la carte

📍 - Position actuelle de l'utilisateur
🌞 - Spots ensoleillés
⛅ - Spots partiellement ensoleillés
☁️ - Spots nuageux

## Interactions

1. Tap sur la carte
   - Zoom in/out
   - Déplacement de la carte
   - Affichage des détails d'un spot au tap

2. Bouton "Y ALLER"
   - Ouvre les options de navigation
   - Choix entre app native ou navigation in-app

3. Bouton Settings (⚙️)
   - Préférences de distance
   - Choix de l'app de navigation par défaut
   - Thème clair/sombre

## États des spots

🟢 Très ensoleillé (>80% d'ensoleillement)
🟡 Partiellement ensoleillé (40-80%)
🔴 Peu/pas ensoleillé (<40%)

## Composants React/Ionic nécessaires

1. `<IonHeader>`
   - Titre de l'app
   - Bouton paramètres

2. `<Map>` (Composant personnalisé)
   - Intégration Leaflet
   - Gestion des marqueurs
   - Gestion de la géolocalisation

3. `<WeatherBar>` (En-tête météo)
   - Conditions actuelles
   - Température
   - Icône météo

4. `<SpotInfo>` (Panneau inférieur)
   - Informations sur le spot le plus proche
   - Bouton de navigation

## Animations et Transitions

1. Chargement de la carte
   - Fade in progressif
   - Indicateur de chargement

2. Mise à jour des spots
   - Animation douce des marqueurs
   - Pulse sur nouveaux spots

3. Panneau d'information
   - Slide up/down
   - Transition fluide des données

## Responsive Design

- Mobile First
- Adaptation de la taille de la carte
- Réorganisation des éléments en mode paysage
- Support tablette avec vue étendue
```
