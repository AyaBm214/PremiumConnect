'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionary: Record<string, Record<Language, string>> = {
    // Auth & Common
    'app.title': { en: 'Premium Booking Connect', fr: 'Premium Booking Connect' },
    'login.title': { en: 'Sign In', fr: 'Connexion' },
    'login.subtitle': { en: 'Manage your properties with ease', fr: 'Gérez vos propriétés en toute simplicité' },
    'login.email': { en: 'Email', fr: 'Courriel' },
    'login.password': { en: 'Password', fr: 'Mot de passe' },
    'login.button': { en: 'Sign In', fr: 'Se connecter' },
    'login.no_account': { en: "Don't have an account?", fr: "Pas encore de compte ?" },
    'login.signup': { en: 'Sign Up', fr: "S'inscrire" },
    'login.error': { en: 'Login error', fr: 'Erreur de connexion' },
    'login.password_req': { en: 'Password required', fr: 'Mot de passe requis' },
    'signup.title': { en: 'Sign Up', fr: 'Inscription' },
    'signup.subtitle': { en: 'Start managing your properties', fr: 'Commencez à gérer vos propriétés' },
    'signup.name': { en: 'Full Name', fr: 'Nom complet' },
    'signup.confirm': { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
    'signup.have_account': { en: 'Already have an account?', fr: 'Déjà un compte ?' },
    'signup.signin': { en: 'Sign In', fr: 'Se connecter' },
    'signup.pass_mismatch': { en: "Passwords don't match", fr: 'Les mots de passe ne correspondent pas' },
    'signup.pass_short': { en: 'Password too short', fr: 'Mot de passe trop court' },
    'signup.error': { en: 'Signup error', fr: "Erreur d'inscription" },
    'signup.check_email': { en: 'Check Your Email', fr: 'Vérifiez votre courriel' },
    'signup.email_sent': { en: 'A confirmation link has been sent to your email address. Please click it to activate your account.', fr: 'Un lien de confirmation a été envoyé à votre adresse courriel. Veuillez cliquer dessus pour activer votre compte.' },

    // Dashboard
    'dash.welcome': { en: 'Welcome back', fr: 'Bienvenue' },
    'dash.subtitle': { en: 'Manage your properties and onboardings', fr: 'Gérez vos propriétés et vos mises en service' },
    'dash.new_prop': { en: '+ New Property', fr: '+ Nouvelle propriété' },
    'dash.profile': { en: 'My Profile', fr: 'Mon Profil' },
    'dash.signout': { en: 'Sign Out', fr: 'Déconnexion' },
    'dash.empty': { en: "You haven't added any properties yet.", fr: "Vous n'avez pas encore ajouté de propriétés." },
    'dash.start_onboarding': { en: 'Start Onboarding', fr: 'Commencer' },
    'dash.in_progress': { en: 'In Progress', fr: 'En cours' },
    'dash.completed': { en: 'Completed', fr: 'Terminé' },
    'dash.last_updated': { en: 'Last updated:', fr: 'Dernière mise à jour :' },
    'dash.continue': { en: 'Continue', fr: 'Continuer' },
    'dash.view_details': { en: 'View Details', fr: 'Voir les détails' },

    // Onboarding Steps
    'step.info': { en: 'Property Info', fr: 'Info Propriété' },
    'step.amenity': { en: 'Amenities', fr: 'Équipements' },
    'step.photos': { en: 'Photos', fr: 'Photos' },
    'step.rules': { en: 'Rules & Fees', fr: 'Règles et Frais' },
    'step.guide': { en: 'Guest Guide', fr: 'Guide Invité' },
    'step.payment': { en: 'Payment', fr: 'Paiement' },
    'step.next': { en: 'Next Step', fr: 'Étape Suivante' },
    'step.back': { en: 'Back', fr: 'Retour' },
    'step.save_exit': { en: 'Save & Exit', fr: 'Sauvegarder & Quitter' },
    'payment.subtitle': { en: 'Where should we send your payouts?', fr: 'Où devons-nous envoyer vos versements ?' },
    'payment.bank': { en: 'Bank Name', fr: 'Nom de la banque' },
    'payment.holder': { en: 'Account Holder Name', fr: 'Nom du titulaire' },
    'payment.institution': { en: 'Institution Number', fr: "Numéro d'institution" },
    'payment.branch': { en: 'Branch (Transit) Number', fr: 'Numéro de transit (Succursale)' },
    'payment.account': { en: 'Account Number', fr: 'Numéro de compte' },

    // Photos Step
    'photos.title': { en: 'Property Photos', fr: 'Photos de la Propriété' },
    'photos.subtitle': { en: 'Upload high-quality photos for each area of your property.', fr: 'Téléchargez des photos de haute qualité pour chaque zone de votre propriété.' },
    'photos.zone.living': { en: 'Living Room', fr: 'Salon' },
    'photos.zone.kitchen': { en: 'Kitchen', fr: 'Cuisine' },
    'photos.zone.exterior': { en: 'Exterior/View', fr: 'Extérieur/Vue' },
    'photos.zone.bedroom': { en: 'Bedroom', fr: 'Chambre' },
    'photos.zone.bathroom': { en: 'Bathroom', fr: 'Salle de bain' },
    'photos.zone.plan': { en: 'Floor Plan / Blueprint', fr: 'Plan d\'étage / Plan' },
    'photos.drive_link': { en: 'Google Drive Link', fr: 'Lien Google Drive' },
    'photos.listing_links': { en: 'Past Listing URLs', fr: 'Anciens liens de l\'annonce' },

    // Guest Guide
    'guide.title': { en: 'Guest Guide & Manuals', fr: 'Guide Invité & Manuels' },
    'guide.wifi': { en: 'Wi-Fi', fr: 'Wi-Fi' },
    'guide.checkin': { en: 'Check-in & Security', fr: 'Arrivée & Sécurité' },
    'guide.access_video': { en: 'Unlock/Lock Instruction (Video)', fr: 'Instruction Verrouillage/Déverrouillage (Vidéo)' },
    'guide.kitchen': { en: 'Kitchen', fr: 'Cuisine' },
    'guide.ac': { en: 'Air Conditioning', fr: 'Climatisation' },
    'guide.extras': { en: 'Extras', fr: 'Extras' },
    'guide.luggage': { en: 'Host Luggage List', fr: 'Liste Valise Hôte' },
    'guide.emergency': { en: 'Emergency Contacts', fr: 'Contacts d\'Urgence' },
    'guide.video_required': { en: 'Access video is mandatory.', fr: 'La vidéo d\'accès est obligatoire.' },

    // Profile
    'profile.title': { en: 'Owner Profile', fr: 'Profil du propriétaire' },
    'profile.subtitle': { en: 'Complete your information to verify your account.', fr: 'Complétez vos informations pour vérifier votre compte.' },
    'profile.fullname': { en: 'Full Name', fr: 'Nom complet' },
    'profile.phone': { en: 'Phone Number', fr: 'Numéro de téléphone' },
    'profile.business': { en: 'Business Number (NEQ)', fr: "Numéro d'entreprise (NEQ)" },
    'profile.section.docs': { en: 'Legal & Financial Documents', fr: 'Documents légaux et financiers' },
    'profile.doc.id': { en: 'Proof of Identity (Passport/License)', fr: "Preuve d'identité (Passeport/Permis)" },
    'profile.doc.void': { en: 'Void Cheque', fr: 'Chèque annulé (Spécimen)' },
    'profile.doc.ins': { en: 'Insurance Attestation', fr: "Attestation d'assurance" },
    'profile.doc.citq': { en: 'CITQ Certificate', fr: 'Certificat CITQ' },
    'profile.tax_confirm': { en: 'I confirm I will handle TPS/TVQ and lodging tax declaration.', fr: "Je confirme que je m'occuperai de la déclaration de TPS/TVQ et de la taxe d'hébergement." },
    'profile.save': { en: 'Save Profile', fr: 'Enregistrer le profil' },
    'profile.saving': { en: 'Saving...', fr: 'Enregistrement...' },
    'profile.uploaded': { en: 'Uploaded', fr: 'Téléchargé' },
    'profile.back': { en: 'Back to Dashboard', fr: 'Retour au tableau de bord' },
    'profile.banking.title': { en: 'Banking Information', fr: 'Informations Bancaires' },
    'profile.banking.canada': { en: 'Canadian Owner', fr: 'Propriétaire Canadien' },
    'profile.banking.intl': { en: 'International Owner', fr: 'Propriétaire International' },
    'profile.banking.canada_instr': { en: 'Please submit a voided cheque only.', fr: 'Veuillez soumettre un chèque annulé uniquement.' },
    'profile.banking.intl_instr': { en: 'Please submit wire transfer instructions only.', fr: 'Veuillez soumettre les instructions de virement bancaire uniquement.' },
    'profile.banking.email_note': { en: 'Banking details should not be uploaded here. Please email these documents directly to us.', fr: 'Les coordonnées bancaires ne doivent pas être téléchargées ici. Veuillez nous envoyer ces documents directement par courriel.' },

    // Amenity Categories
    'amenity.cat.living': { en: 'Living Room', fr: 'Salon' },
    'amenity.cat.kitchen': { en: 'Kitchen', fr: 'Cuisine' },
    'amenity.cat.internet': { en: 'Internet & Office', fr: 'Internet & Bureau' },
    'amenity.cat.heating': { en: 'Heating & Cooling', fr: 'Chauffage & Climatisation' },
    'amenity.cat.laundry': { en: 'Laundry', fr: 'Buanderie' },
    'amenity.cat.baby': { en: 'Baby & Family', fr: 'Bébé & Famille' },
    'amenity.cat.safety': { en: 'Safety & Security', fr: 'Sécurité' },
    'amenity.cat.outdoor': { en: 'Outdoor', fr: 'Extérieur' },
    'amenity.cat.wellness': { en: 'Wellness & Leisure', fr: 'Bien-être & Loisirs' },
    'amenity.cat.parking': { en: 'Parking & Access', fr: 'Parking & Accès' },
    'amenity.cat.pets': { en: 'Pets', fr: 'Animaux' },
    'amenity.cat.features': { en: 'House Features', fr: 'Caractéristiques' },
    'amenity.cat.location': { en: 'Location & Nearby', fr: 'Emplacement & Alentours' },
    'amenity.cat.services': { en: 'Services (Optional)', fr: 'Services (Optionnel)' },
    'amenity.cat.other': { en: 'Other Amenities', fr: 'Autres Équipements' },

    // Amenity Items
    // Living Room
    'amenity.Sofa': { en: 'Sofa', fr: 'Canapé' },
    'amenity.Sofa bed': { en: 'Sofa bed', fr: 'Canapé-lit' },
    'amenity.Armchair': { en: 'Armchair', fr: 'Fauteuil' },
    'amenity.Coffee table': { en: 'Coffee table', fr: 'Table basse' },
    'amenity.TV': { en: 'TV', fr: 'Télévision' },
    'amenity.Smart TV': { en: 'Smart TV', fr: 'Smart TV' },
    'amenity.Cable TV': { en: 'Cable TV', fr: 'Télévision par câble' },
    'amenity.Streaming services': { en: 'Streaming services', fr: 'Services de streaming' },
    'amenity.Sound system': { en: 'Sound system', fr: 'Système audio' },
    'amenity.Board games': { en: 'Board games', fr: 'Jeux de société' },
    'amenity.Books': { en: 'Books', fr: 'Livres' },
    'amenity.Fireplace': { en: 'Fireplace', fr: 'Cheminée' },
    'amenity.Air conditioning': { en: 'Air conditioning', fr: 'Climatisation' },
    'amenity.Heating': { en: 'Heating', fr: 'Chauffage' },
    'amenity.Fan': { en: 'Fan', fr: 'Ventilateur' },
    'amenity.Curtains / blackout curtains': { en: 'Curtains / blackout curtains', fr: 'Rideaux / Rideaux occultants' },
    'amenity.Extra pillows & blankets': { en: 'Extra pillows & blankets', fr: 'Oreillers & couvertures supplémentaires' },

    // Kitchen
    'amenity.Refrigerator': { en: 'Refrigerator', fr: 'Réfrigérateur' },
    'amenity.Freezer': { en: 'Freezer', fr: 'Congélateur' },
    'amenity.Oven': { en: 'Oven', fr: 'Four' },
    'amenity.Microwave': { en: 'Microwave', fr: 'Micro-ondes' },
    'amenity.Stove': { en: 'Stove', fr: 'Cuisinière' },
    'amenity.Dishwasher': { en: 'Dishwasher', fr: 'Lave-vaisselle' },
    'amenity.Coffee machine': { en: 'Coffee machine', fr: 'Machine à café' },
    'amenity.Kettle': { en: 'Kettle', fr: 'Bouilloire' },
    'amenity.Toaster': { en: 'Toaster', fr: 'Grille-pain' },
    'amenity.Blender': { en: 'Blender', fr: 'Mixeur' },
    'amenity.Rice cooker': { en: 'Rice cooker', fr: 'Cuiseur à riz' },
    'amenity.Pots & pans': { en: 'Pots & pans', fr: 'Casseroles & poêles' },
    'amenity.Cooking utensils': { en: 'Cooking utensils', fr: 'Ustensiles de cuisine' },
    'amenity.Plates & bowls': { en: 'Plates & bowls', fr: 'Assiettes & bols' },
    'amenity.Cutlery': { en: 'Cutlery', fr: 'Couverts' },
    'amenity.Wine glasses': { en: 'Wine glasses', fr: 'Verres à vin' },
    'amenity.Cups & mugs': { en: 'Cups & mugs', fr: 'Tasses & mugs' },
    'amenity.Basic cooking essentials': { en: 'Basic cooking essentials', fr: 'Essentiels de cuisine (huile, sel, poivre)' },
    'amenity.Dining table': { en: 'Dining table', fr: 'Table à manger' },

    // Internet & Office
    'amenity.WiFi': { en: 'WiFi', fr: 'WiFi' },
    'amenity.High-speed WiFi': { en: 'High-speed WiFi', fr: 'WiFi haut débit' },
    'amenity.Ethernet connection': { en: 'Ethernet connection', fr: 'Connexion Ethernet' },
    'amenity.Desk': { en: 'Desk', fr: 'Bureau' },
    'amenity.Office chair': { en: 'Office chair', fr: 'Chaise de bureau' },
    'amenity.Printer': { en: 'Printer', fr: 'Imprimante' },

    // Heating & Cooling
    'amenity.Central heating': { en: 'Central heating', fr: 'Chauffage central' },
    'amenity.Portable heater': { en: 'Portable heater', fr: 'Chauffage d\'appoint' },

    // Laundry
    'amenity.Washing machine': { en: 'Washing machine', fr: 'Lave-linge' },
    'amenity.Dryer': { en: 'Dryer', fr: 'Sèche-linge' },
    'amenity.Laundry detergent': { en: 'Laundry detergent', fr: 'Lessive' },
    'amenity.Drying rack': { en: 'Drying rack', fr: 'Étendoir' },

    // Baby & Family
    'amenity.High chair': { en: 'High chair', fr: 'Chaise haute' },
    'amenity.Baby bath': { en: 'Baby bath', fr: 'Baignoire pour bébé' },
    'amenity.Baby monitor': { en: 'Baby monitor', fr: 'Babyphone' },
    'amenity.Changing table': { en: 'Changing table', fr: 'Table à langer' },
    'amenity.Baby safety gates': { en: 'Baby safety gates', fr: 'Barrières de sécurité' },
    'amenity.Outlet covers': { en: 'Outlet covers', fr: 'Cache-prises' },
    'amenity.Children\'s books': { en: 'Children\'s books', fr: 'Livres pour enfants' },
    'amenity.Toys': { en: 'Toys', fr: 'Jouets' },

    // Safety & Security
    'amenity.Smoke detector': { en: 'Smoke detector', fr: 'Détecteur de fumée' },
    'amenity.Carbon monoxide detector': { en: 'Carbon monoxide detector', fr: 'Détecteur de monoxyde de carbone' },
    'amenity.Fire extinguisher': { en: 'Fire extinguisher', fr: 'Extincteur' },
    'amenity.First aid kit': { en: 'First aid kit', fr: 'Trousse de premiers secours' },
    'amenity.Security cameras (outside only)': { en: 'Security cameras (outside only)', fr: 'Caméras de sécurité (extérieur uniquement)' },
    'amenity.Alarm system': { en: 'Alarm system', fr: 'Système d\'alarme' },
    'amenity.Smart lock': { en: 'Smart lock', fr: 'Serrure connectée' },
    'amenity.Keypad lock': { en: 'Keypad lock', fr: 'Serrure à code' },
    'amenity.Lockbox': { en: 'Lockbox', fr: 'Boîte à clés' },
    'amenity.Safe': { en: 'Safe', fr: 'Coffre-fort' },

    // Outdoor
    'amenity.Balcony': { en: 'Balcony', fr: 'Balcon' },
    'amenity.Terrace': { en: 'Terrace', fr: 'Terrasse' },
    'amenity.Patio': { en: 'Patio', fr: 'Patio' },
    'amenity.Garden': { en: 'Garden', fr: 'Jardin' },
    'amenity.Outdoor furniture': { en: 'Outdoor furniture', fr: 'Mobilier extérieur' },
    'amenity.BBQ grill': { en: 'BBQ grill', fr: 'Barbecue' },
    'amenity.Outdoor dining area': { en: 'Outdoor dining area', fr: 'Espace repas extérieur' },
    'amenity.Fire pit': { en: 'Fire pit', fr: 'Brasero' },
    'amenity.Hammock': { en: 'Hammock', fr: 'Hamac' },

    // Wellness & Leisure
    'amenity.Swimming pool (private)': { en: 'Swimming pool (private)', fr: 'Piscine (privée)' },
    'amenity.Swimming pool (shared)': { en: 'Swimming pool (shared)', fr: 'Piscine (partagée)' },
    'amenity.Hot tub / Jacuzzi': { en: 'Hot tub / Jacuzzi', fr: 'Spa / Jacuzzi' },
    'amenity.Sauna': { en: 'Sauna', fr: 'Sauna' },
    'amenity.Gym / fitness equipment': { en: 'Gym / fitness equipment', fr: 'Salle de sport / équipements' },
    'amenity.Yoga mat': { en: 'Yoga mat', fr: 'Tapis de yoga' },
    'amenity.Massage chair': { en: 'Massage chair', fr: 'Fauteuil massant' },

    // Parking & Access
    'amenity.Free parking on premises': { en: 'Free parking on premises', fr: 'Parking gratuit sur place' },
    'amenity.Free street parking': { en: 'Free street parking', fr: 'Parking gratuit dans la rue' },
    'amenity.Paid parking nearby': { en: 'Paid parking nearby', fr: 'Parking payant à proximité' },
    'amenity.EV charger': { en: 'EV charger', fr: 'Borne de recharge VE' },
    'amenity.Elevator': { en: 'Elevator', fr: 'Ascenseur' },
    'amenity.Wheelchair accessible': { en: 'Wheelchair accessible', fr: 'Accessible aux fauteuils roulants' },

    // Pets
    'amenity.Pets allowed': { en: 'Pets allowed', fr: 'Animaux acceptés' },
    'amenity.Pet bowls': { en: 'Pet bowls', fr: 'Gamelles' },
    'amenity.Pet bed': { en: 'Pet bed', fr: 'Lit pour animaux' },
    'amenity.Fenced yard': { en: 'Fenced yard', fr: 'Cour clôturée' },

    // House Features
    'amenity.Smoking allowed': { en: 'Smoking allowed', fr: 'Fumeurs acceptés' },
    'amenity.Long-term stays allowed': { en: 'Long-term stays allowed', fr: 'Séjours longue durée' },
    'amenity.Self check-in': { en: 'Self check-in', fr: 'Arrivée autonome' },
    'amenity.Keyless entry': { en: 'Keyless entry', fr: 'Entrée sans clé' },

    // Location
    'amenity.Beach access': { en: 'Beach access', fr: 'Accès plage' },
    'amenity.Lake access': { en: 'Lake access', fr: 'Accès lac' },
    'amenity.Ski-in / Ski-out': { en: 'Ski-in / Ski-out', fr: 'Accès skis aux pieds' },
    'amenity.Hiking trails nearby': { en: 'Hiking trails nearby', fr: 'Sentiers de randonnée' },
    'amenity.Bike paths': { en: 'Bike paths', fr: 'Pistes cyclables' },
    'amenity.Restaurants nearby': { en: 'Restaurants nearby', fr: 'Restaurants à proximité' },
    'amenity.Public transport nearby': { en: 'Public transport nearby', fr: 'Transports en commun' },
    'amenity.Grocery store nearby': { en: 'Grocery store nearby', fr: 'Épicerie à proximité' },
    'amenity.Tourist attractions nearby': { en: 'Tourist attractions nearby', fr: 'Attractions touristiques' },

    // Services
    'amenity.Cleaning service available': { en: 'Cleaning service available', fr: 'Service de ménage' },
    'amenity.Breakfast available': { en: 'Breakfast available', fr: 'Petit-déjeuner inclus' },
    'amenity.Concierge service': { en: 'Concierge service', fr: 'Conciergerie' },
    'amenity.Airport pickup': { en: 'Airport pickup', fr: 'Navette aéroport' },

    // Bedrooms
    'amenity.Queen bed': { en: 'Queen bed', fr: 'Lit Queen' },
    'amenity.King bed': { en: 'King bed', fr: 'Lit King' },
    'amenity.Double bed': { en: 'Double bed', fr: 'Lit Double' },
    'amenity.Single bed': { en: 'Single bed', fr: 'Lit Simple' },
    'amenity.Bunk bed': { en: 'Bunk bed', fr: 'Lits superposés' },
    'amenity.Crib (baby)': { en: 'Crib (baby)', fr: 'Lit bébé' },
    'amenity.Bedside table': { en: 'Bedside table', fr: 'Table de chevet' },
    'amenity.Reading lamp': { en: 'Reading lamp', fr: 'Lampe de lecture' },
    'amenity.Wardrobe / closet': { en: 'Wardrobe / closet', fr: 'Armoire / Penderie' },
    'amenity.Hangers': { en: 'Hangers', fr: 'Cintres' },
    'amenity.Iron': { en: 'Iron', fr: 'Fer à repasser' },
    'amenity.Ironing board': { en: 'Ironing board', fr: 'Planche à repasser' },
    'amenity.Extra pillows': { en: 'Extra pillows', fr: 'Oreillers supplémentaires' },
    'amenity.Extra blankets': { en: 'Extra blankets', fr: 'Couvertures supplémentaires' },
    'amenity.Desk / workspace': { en: 'Desk / workspace', fr: 'Bureau / Espace de travail' },

    // Bathrooms
    'amenity.Shower': { en: 'Shower', fr: 'Douche' },
    'amenity.Bathtub': { en: 'Bathtub', fr: 'Baignoire' },
    'amenity.Hot water': { en: 'Hot water', fr: 'Eau chaude' },
    'amenity.Shampoo': { en: 'Shampoo', fr: 'Shampoing' },
    'amenity.Conditioner': { en: 'Conditioner', fr: 'Après-shampoing' },
    'amenity.Body soap': { en: 'Body soap', fr: 'Gel douche' },
    'amenity.Towels': { en: 'Towels', fr: 'Serviettes' },
    'amenity.Toilet paper': { en: 'Toilet paper', fr: 'Papier toilette' },
    'amenity.Hair dryer': { en: 'Hair dryer', fr: 'Sèche-cheveux' },
    'amenity.Bidet': { en: 'Bidet', fr: 'Bidet' },
    'amenity.Mirror': { en: 'Mirror', fr: 'Miroir' },
    'amenity.Cleaning products': { en: 'Cleaning products', fr: 'Produits de nettoyage' },

    // Hot Tub
    'amenity.hottub_date': { en: 'Hot Tub Opening Date', fr: "Date d'ouverture du Spa" },
    'amenity.pool_date': { en: 'Pool Opening Date', fr: "Date d'ouverture de la piscine" },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const stored = localStorage.getItem('app_lang') as Language;
        if (stored) setLanguage(stored);
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app_lang', lang);
    };

    const t = (key: string) => {
        return dictionary[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
}
