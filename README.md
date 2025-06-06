# OkMeeting - Plateforme de Gestion des Appels à Projets GBH

## Stack Technique

- **Frontend**
  - React 18 avec TypeScript
  - Vite pour le bundling et le développement
  - Tailwind CSS pour le styling
  - React Router pour la navigation
  - Lucide React pour les icônes
  - Sonner pour les notifications toast

- **Backend & Database**
  - Supabase pour l'authentification et la base de données
  - PostgreSQL comme base de données
  - Row Level Security (RLS) pour la sécurité des données

- **API & Services**
  - OpenRouter API pour les traductions en temps réel
  - Web Speech API pour la reconnaissance vocale
  - SpeechSynthesis pour la synthèse vocale

## Fonctionnalités Implémentées

### Authentification & Sécurité
- Système de connexion/inscription complet
- Protection des routes avec authentification
- Gestion des statuts utilisateurs (actif, suspendu, supprimé)
- Politiques RLS pour la sécurité des données

### Gestion des Enregistrements
- Création d'enregistrements vocaux
- Transcription en temps réel
- Traduction automatique vers plusieurs langues (EN, ES, FR, IT)
- Historique des enregistrements avec pagination
- Recherche et filtrage par date
- Édition des titres d'enregistrements
- Suppression d'enregistrements avec confirmation

### Interface Utilisateur
- Design responsive et moderne
- Navigation fluide entre les pages
- Feedback utilisateur avec notifications toast
- Modales de confirmation pour les actions importantes
- Support multilingue pour les traductions

## User Stories

### En tant que visiteur
- Je peux consulter la page d'accueil pour comprendre l'objectif du projet
- Je peux m'inscrire pour créer un compte
- Je peux me connecter à mon compte existant

### En tant qu'utilisateur connecté
- Je peux démarrer un nouvel enregistrement
- Je peux voir la transcription de mon enregistrement en temps réel
- Je peux obtenir une traduction instantanée dans la langue de mon choix
- Je peux consulter l'historique de mes enregistrements
- Je peux rechercher des enregistrements par titre
- Je peux filtrer mes enregistrements par date
- Je peux modifier le titre de mes enregistrements
- Je peux supprimer mes enregistrements
- Je peux écouter mes enregistrements précédents
- Je peux voir mon statut de compte (actif, suspendu, supprimé)
- Je peux me déconnecter de mon compte

### En tant qu'administrateur
- Je peux gérer les statuts des utilisateurs
- Je peux suivre l'activité des utilisateurs via leurs enregistrements

## Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Construction pour la production
npm run build
```

## Variables d'Environnement Requises

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## Déploiement

Le projet est configuré pour un déploiement sur Netlify avec les redirections appropriées pour le routage SPA.