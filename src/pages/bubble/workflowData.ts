import {
  Home, UserPlus, FileText, Upload, Send, Eye, Search,
  CheckCircle, XCircle, AlertTriangle, Mic,
  LayoutDashboard, PlayCircle, LogIn, ClipboardCheck,
  PenTool, FolderOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FlowStep {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
}

export interface WorkflowSection {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  steps: FlowStep[];
  branches?: FlowStep[][];
}

export const workflows: WorkflowSection[] = [
  {
    id: 'user-journey',
    title: 'Parcours Utilisateur',
    subtitle: "De la découverte du programme jusqu'au dépôt du dossier",
    accentColor: 'blue',
    steps: [
      { id: 'landing', label: 'Accueil', description: "Page d'accueil avec les informations du programme", icon: Home, bgColor: 'bg-blue-400' },
      { id: 'signup', label: 'Inscription', description: 'Création de compte utilisateur', icon: UserPlus, bgColor: 'bg-blue-500' },
      { id: 'form', label: 'Formulaire', description: "Saisie des informations de l'exploitation et du projet en 4 étapes", icon: FileText, bgColor: 'bg-blue-500' },
      { id: 'upload', label: 'Documents', description: 'Téléversement des justificatifs (SIRET, K-bis, devis)', icon: Upload, bgColor: 'bg-blue-600' },
      { id: 'sign', label: 'Signature', description: 'Signature numérique et engagement légal', icon: PenTool, bgColor: 'bg-blue-600' },
      { id: 'submit', label: 'Soumission', description: 'Envoi du dossier complet pour examen', icon: Send, bgColor: 'bg-blue-700' },
      { id: 'status', label: 'Suivi', description: 'Consultation du statut et des retours administratifs', icon: Eye, bgColor: 'bg-blue-700' },
    ],
  },
  {
    id: 'supernovae-review',
    title: 'Validation Super-Novae',
    subtitle: "Examen initial du dossier par l'équipe Super-Novae",
    accentColor: 'emerald',
    steps: [
      { id: 'sn-login', label: 'Connexion', description: "Accès au tableau de bord d'administration", icon: LogIn, bgColor: 'bg-emerald-500' },
      { id: 'sn-dashboard', label: 'Tableau de bord', description: 'Liste des candidatures avec filtres et recherche', icon: LayoutDashboard, bgColor: 'bg-emerald-500' },
      { id: 'sn-review', label: 'Examen', description: 'Vérification détaillée du dossier et des documents', icon: Search, bgColor: 'bg-emerald-600' },
    ],
    branches: [
      [{ id: 'sn-conforme', label: 'Conforme', description: 'Dossier validé et transmis à GBH', icon: CheckCircle, bgColor: 'bg-green-500' }],
      [{ id: 'sn-manquants', label: 'Éléments manquants', description: 'Le demandeur doit compléter son dossier', icon: AlertTriangle, bgColor: 'bg-amber-500' }],
      [{ id: 'sn-refuse', label: 'Refusé', description: 'Le dossier ne remplit pas les critères requis', icon: XCircle, bgColor: 'bg-red-500' }],
    ],
  },
  {
    id: 'gbh-review',
    title: 'Validation GBH',
    subtitle: 'Décision finale par GBH sur les dossiers conformes',
    accentColor: 'amber',
    steps: [
      { id: 'gbh-login', label: 'Connexion', description: 'Accès au tableau de bord GBH', icon: LogIn, bgColor: 'bg-amber-500' },
      { id: 'gbh-dashboard', label: 'Dossiers conformes', description: 'Consultation des dossiers validés par Super-Novae', icon: FolderOpen, bgColor: 'bg-amber-500' },
      { id: 'gbh-review', label: 'Examen final', description: 'Évaluation finale du dossier', icon: ClipboardCheck, bgColor: 'bg-amber-600' },
    ],
    branches: [
      [{ id: 'gbh-valide', label: 'Validé', description: 'Projet approuvé et financé', icon: CheckCircle, bgColor: 'bg-green-500' }],
      [{ id: 'gbh-refuse', label: 'Refusé', description: 'Projet rejeté avec motif', icon: XCircle, bgColor: 'bg-red-500' }],
    ],
  },
  {
    id: 'voice-recording',
    title: 'Enregistrements Vocaux',
    subtitle: 'Capture et transcription avec traduction automatique',
    accentColor: 'sky',
    steps: [
      { id: 'vr-dashboard', label: 'Dashboard', description: 'Liste des enregistrements avec recherche et pagination', icon: LayoutDashboard, bgColor: 'bg-sky-500' },
      { id: 'vr-new', label: 'Enregistrer', description: 'Capture vocale en temps réel avec choix de la langue cible', icon: Mic, bgColor: 'bg-sky-600' },
      { id: 'vr-view', label: 'Consultation', description: 'Lecture des transcriptions et traductions horodatées', icon: PlayCircle, bgColor: 'bg-sky-700' },
    ],
  },
];

export interface StatusTransition {
  from: string;
  fromColor: string;
  to: string;
  toColor: string;
  action: string;
  actor: string;
  actorColor: string;
}

export const statusTransitions: StatusTransition[] = [
  { from: 'Brouillon', fromColor: 'bg-gray-100 text-gray-700', to: 'Étude en cours', toColor: 'bg-blue-100 text-blue-700', action: 'Soumission du dossier', actor: 'Utilisateur', actorColor: 'text-blue-600' },
  { from: 'Étude en cours', fromColor: 'bg-blue-100 text-blue-700', to: 'Dossier conforme', toColor: 'bg-emerald-100 text-emerald-700', action: 'Validation du dossier', actor: 'Super-Novae', actorColor: 'text-emerald-600' },
  { from: 'Étude en cours', fromColor: 'bg-blue-100 text-blue-700', to: 'Éléments manquants', toColor: 'bg-amber-100 text-amber-700', action: 'Demande de compléments', actor: 'Super-Novae', actorColor: 'text-emerald-600' },
  { from: 'Étude en cours', fromColor: 'bg-blue-100 text-blue-700', to: 'Refusé', toColor: 'bg-red-100 text-red-700', action: 'Rejet du dossier', actor: 'Super-Novae', actorColor: 'text-emerald-600' },
  { from: 'Éléments manquants', fromColor: 'bg-amber-100 text-amber-700', to: 'Étude en cours', toColor: 'bg-blue-100 text-blue-700', action: 'Mise à jour du dossier', actor: 'Utilisateur', actorColor: 'text-blue-600' },
  { from: 'Dossier conforme', fromColor: 'bg-emerald-100 text-emerald-700', to: 'Validé', toColor: 'bg-green-100 text-green-700', action: 'Approbation finale', actor: 'GBH', actorColor: 'text-amber-600' },
  { from: 'Dossier conforme', fromColor: 'bg-emerald-100 text-emerald-700', to: 'Refusé', toColor: 'bg-red-100 text-red-700', action: 'Rejet final', actor: 'GBH', actorColor: 'text-amber-600' },
];
