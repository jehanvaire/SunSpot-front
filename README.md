# SunSpot - Trouvez le soleil le plus proche !

## Description du Projet
SunSpot est une application mobile développée avec Ionic qui permet aux utilisateurs de localiser l'endroit le plus proche où il fait soleil. L'application utilise la géolocalisation et les données météorologiques en temps réel pour guider les utilisateurs vers les zones ensoleillées les plus proches.

## Démarrage Rapide

### Prérequis
- Node.js 20+
- npm ou yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio (pour le build Android)
- Xcode (pour le build iOS)

### Installation
1. Cloner le projet
```bash
git clone [URL_DU_REPO]
cd SunSpot-front
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer en développement
```bash
ionic serve
```

4. Build pour mobile

[Documentation](https://capacitorjs.com/docs/android) de capacitor pour android
[Documentation](https://capacitorjs.com/docs/ios) de capacitor pour iOS


## Technologies Utilisées

### Framework Principal
- Ionic 8.0
- React 18

### Langage de Programmation
- TypeScript 5.0+

### Environnement de Développement
- Capacitor (pour les fonctionnalités natives)

### Cartographie et Géolocalisation
- Leaflet.js (bibliothèque de cartographie open-source)
- API Navigator.geolocation (solution principale pour la géolocalisation)
- Leaflet Routing Machine (pour l'affichage des itinéraires)
- Capacitor (comme solution de fallback pour les fonctionnalités natives avancées)

### Navigation et Routage
- Leaflet Routing Machine (affichage des itinéraires dans l'app)
- Launch Navigator via Capacitor (pour la navigation native)

### API Météo
- OpenWeather API (pour les données météorologiques en temps réel)

### UI/UX Components
- Ionic Components
- Ionic Icons
- Custom SCSS pour le theming

## Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── Map/             # Composant carte
│   │   ├── Map.tsx
│   │   ├── index.ts
│   │   └── styles/
│   │       └── Map.scss
│   ├── Weather/         # Composant météo
│   │   └── styles/
│   ├── Navigation/      # Composant navigation
│   │   └── styles/
│   └── Layout/          # Composants de mise en page
│       └── styles/
├── pages/               # Pages de l'application
│   ├── Home/           # Page d'accueil
│   │   ├── Home.tsx
│   │   ├── index.ts
│   │   └── styles/
│   │       └── Home.scss
│   ├── Settings/       # Page paramètres
│   │   └── styles/
│   └── About/          # Page à propos
│       └── styles/
├── hooks/              # Custom React hooks
├── services/           # Services (API, géolocation)
├── utils/             # Fonctions utilitaires
├── assets/            # Ressources statiques
│   ├── icons/
│   └── images/
├── theme/             # Thème global
│   └── variables/
└── types/             # Types TypeScript
```

### Dépendances Principales
```json
{
  "dependencies": {
    "@ionic/react": "^8.0.0",
    "react": "^18.0.0",
    "@capacitor/core": "^5.0.0",
    "@capacitor/geolocation": "^5.0.0",
    "leaflet": "^1.9.0",
    "leaflet-routing-machine": "^3.2.12",
    "@capacitor-community/launch-navigator": "^3.0.0"
  }
}
```

## Scripts Disponibles

- `npm start` : Lance l'application en mode développement
- `npm run build` : Build l'application pour la production
- `npm run test` : Lance les tests
- `npm run lint` : Vérifie le code avec ESLint
- `npm run format` : Formate le code avec Prettier

## Bonnes Pratiques

### Architecture et Organisation
- Un composant = Un dossier avec ses propres styles
- Styles modulaires avec SCSS
- Types TypeScript stricts
- Tests unitaires pour chaque composant
- Documentation du code

### Style de Code
- Utilisation de TypeScript strict mode
- ESLint pour la qualité du code
- Prettier pour le formatage
- Composants fonctionnels React avec Hooks

### Gestion d'État
- Hooks React pour la gestion d'état locale
- Context API pour l'état global si nécessaire
- Services isolés pour la logique métier

## Contribution

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Créer une Pull Request

## Licence

[Type de Licence]
