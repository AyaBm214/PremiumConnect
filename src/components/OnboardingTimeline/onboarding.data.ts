import { OnboardingStep } from "./onboarding.types";

export const STEPS: OnboardingStep[] = [
  { id: 1, title: "Signature du contrat", description: "Formalisation de votre engagement avec Premium Booking", phase: "preparation", optional: false, dayRange: "Jour 1", icon: "FileSignature" },
  { id: 2, title: "Démarrage d'embarquement", description: "Formulaire préparatoire — informations complètes sur votre bien", phase: "preparation", optional: false, dayRange: "Jour 1–2", icon: "ClipboardList" },
  { id: 3, title: "Service de design", description: "Optimisation visuelle de votre espace pour maximiser l'attrait", phase: "preparation", optional: true, dayRange: "Jour 2–4", icon: "Paintbrush" },
  { id: 4, title: "Session photo professionnelle", description: "Prise de vue de qualité pour sublimer votre annonce", phase: "preparation", optional: false, dayRange: "Jour 3–5", icon: "Camera" },
  { id: 5, title: "Rencontre d'embarquement", description: "Appel avec votre concierge VIP pour aligner les attentes", phase: "preparation", optional: true, dayRange: "Jour 4–6", icon: "Video" },
  { id: 6, title: "Stratégie tarifaire", description: "Présentation et validation du positionnement prix optimal", phase: "preparation", optional: false, dayRange: "Jour 5–7", icon: "DollarSign" },
  { id: 7, title: "Validation des annonces", description: "Vérification de l'exactitude et qualité de tous les contenus", phase: "lancement", optional: false, dayRange: "Jour 8–10", icon: "CheckSquare" },
  { id: 8, title: "Mise en ligne", description: "Publication simultanée sur toutes les plateformes partenaires", phase: "lancement", optional: false, dayRange: "Jour 10–12", icon: "Rocket" },
  { id: 9, title: "Les réservations arrivent !", description: "Votre bien est actif et génère ses premières réservations", phase: "lancement", optional: false, dayRange: "Jour 14", icon: "Home" },
];
