import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import styles from './Step.module.css';

interface StepContractProps {
    data?: {
        status: 'approved' | 'changes_requested';
        comments?: string;
    };
    onUpdate: (data: { status: 'approved' | 'changes_requested'; comments?: string; reviewedAt: string }) => void;
    onNext: () => void;
    onBack: () => void;
}

const CONTRACT_TEXT = `CONTRAT DE LOCATION À COURT TERME
Premium Booking – Gestion Immobilière Kabinaa Inc.
Courriel : yanis@premiumbooking.ca
Téléphone : +1-514-612-4813
Adresse : 3901 Céline-Marier, Saint-Laurent, QC H4R 3N3, Canada

1. OBJECTIF DU CONTRAT
Ce contrat établit les conditions dans lesquelles le Propriétaire/Gestionnaire loue temporairement la propriété au Locataire/Voyageur pour un logement à court terme.
Le Propriétaire/Gestionnaire est identifié comme Gestion Immobilière Kabinaa Inc.
Le Locataire/Voyageur est la personne qui a effectué la réservation soit directement avec Premium Booking, soit par l'intermédiaire d'une agence de voyage en ligne (par exemple, Airbnb).
Le Locataire/Voyageur doit avoir au moins 25 ans et doit rester sur les lieux pendant toute la durée du séjour.
Ce contrat constitue uniquement un hébergement temporaire. Il ne constitue pas un bail résidentiel et ne confère aucun droit d'occupation au-delà du séjour confirmé. Aucun droit de maintien dans les lieux ou privilège de location à long terme n'existe.
Le Locataire/Voyageur doit quitter la propriété à la fin du séjour.

2. DÉTAILS DU SÉJOUR
• Arrivée : Heure exacte fournie dans les instructions d'arrivée.
• Départ : Heure exacte fournie dans les instructions de départ.
• Occupation maximale : Comme indiqué dans l'annonce de la propriété.
• Adresse de la propriété : Comme indiqué dans les instructions d'arrivée.
Départ retardé
Si le Locataire/Voyageur dépasse l'heure de départ désignée et que cela entraîne des frais supplémentaires, des retards pour le ménage ou des perturbations opérationnelles, le Propriétaire/Gestionnaire pourra facturer des frais supplémentaires correspondant au coût raisonnable occasionné par la remise en état de la propriété pour la prochaine arrivée.
Cette clause est uniquement destinée à assurer des opérations de turnover fluides.
Le Locataire/Voyageur accepte de ne pas dépasser l'occupation maximale à tout moment.

3. CONDITION ET UTILISATION DE LA PROPRIÉTÉ
Le Locataire/Voyageur doit :
• Maintenir la propriété dans un état propre et en bon état pendant le séjour.
• Signaler immédiatement tout dommage.
• Assumer le coût de tout dommage au-delà de l'usure normale.
• Respecter toutes les exigences de stationnement, y compris se garer uniquement dans l'allée ou l'entrée désignée de la propriété. Le stationnement dans la rue est interdit, sauf autorisation écrite du Propriétaire/Gestionnaire.
• La propriété doit être utilisée de manière responsable et exclusivement pour un hébergement personnel.
• L'utilisation commerciale, les événements ou les rassemblements dépassant le nombre d'occupants autorisés sont interdits.

4. RESPECT DU CALME & DES VOISINS
Pour préserver un environnement paisible :
• Aucun bruit extérieur n'est permis après 22h00 ou avant 8h00.
• Toute perturbation susceptible de déranger les voisins est interdite.
• Les feux d'artifice sont strictement interdits.
• Le Locataire/Voyageur doit s'assurer que tous les invités et visiteurs respectent ces règles.

5. ANIMAUX
Les animaux sont autorisés uniquement avec l'approbation préalable du Propriétaire/Gestionnaire par écrit.
Les animaux doivent :
• Être licenciés et tenus en laisse à l'extérieur,
• Ne jamais être laissés dehors pendant la nuit.
• Vérifiez les politiques de l'annonce pour savoir si les animaux sont approuvés ou non.
• Le Locataire/Voyageur est responsable de tout dommage ou perturbation causé par les animaux.

6. CAMPING, REMORQUES & VÉHICULES RÉCRÉATIFS
Les tentes, remorques, VR ou installations similaires ne sont pas autorisés sur ou autour de la propriété.

7. UTILISATION DES EMBARCATIONS
Seules les embarcations fournies par le Propriétaire/Gestionnaire peuvent être utilisées.
Le lancement de bateaux personnels, loués ou empruntés sur les eaux municipales est interdit.

8. GESTION DES DÉCHETS
Le Locataire/Voyageur doit :
• Mettre les ordures dans les bacs désignés,
• Suivre les horaires de collecte locaux,
• Garder les bacs fermés avec le loquet sécurisé,
• Signaler immédiatement tout problème lié aux déchets au Propriétaire/Gestionnaire.
• Les déchets ne doivent pas être laissés à l'extérieur pendant de longues périodes.

9. SOUS-LOCATION
Le Locataire/Voyageur ne peut pas sous-louer, céder ou transférer la location, en tout ou en partie.

10. FUMÉE
Il est strictement interdit de fumer ou de vapoter à l'intérieur.
La fumée à l'extérieur est autorisée uniquement à une distance minimale de 9 mètres (environ 30 pieds) et jamais à proximité de la propriété.
Une pénalité de 250 $ s'applique pour la fumée intérieure.

11. ÉQUIPEMENT DE SÉCURITÉ
La propriété comprend :
• Extincteur,
• Détecteurs de fumée,
• Détecteur de monoxyde de carbone.
• Le Locataire/Voyageur doit signaler immédiatement tout dysfonctionnement ou équipement manquant.

12. DÉPÔT DE SÉCURITÉ, POLITIQUE D'ANNULATION & CONDITIONS DE REMBOURSEMENT
Un dépôt de sécurité, comme indiqué dans les instructions d'arrivée, est requis du Locataire/Voyageur.
Le dépôt peut être fourni par :
• Virement Interac, ou
• Prélèvement sur carte de crédit pour le montant requis.
• Le dépôt de sécurité sera remboursé dans un délai d'une semaine après une inspection satisfaisante de la propriété après le départ.
Si des dommages, des éléments manquants, un nettoyage excessif ou tout autre problème sont observés, le coût associé à ces dommages ou problèmes sera déduit du dépôt de sécurité.

13. LIMITATION DE RESPONSABILITÉ
Le Locataire/Voyageur assume tous les risques liés à l'utilisation de la propriété, sauf en cas de négligence avérée du Propriétaire/Gestionnaire.
Le Propriétaire/Gestionnaire n'est pas responsable de :
• Les blessures personnelles,
• La perte ou le vol d'effets personnels,
• Les dommages résultant d'une mauvaise utilisation de la propriété ou des équipements.

14. UTILISATION LÉGALE
Les lieux doivent être utilisés uniquement à des fins légales.
Toute activité illégale entraîne la résiliation immédiate sans remboursement.

15. DROITS D'ACCÈS & DE RÉSILIATION
Le Propriétaire/Gestionnaire peut accéder à la propriété pour vérifier la conformité ou traiter les problèmes urgents.
La violation de toute clause peut entraîner l'éviction immédiate sans remboursement.

16. OBLIGATIONS DU LOCATAIRE/VOYAGEUR
Le Locataire/Voyageur doit :
• Maintenir la propriété dans un état propre et prêt à être loué,
• Respecter l'occupation maximale,
• Éviter les perturbations,
• Fermer à clé portes et fenêtres en quittant,
• Ne pas posséder d'armes à feu ou de substances illégales,
• Suivre les instructions des systèmes CVC (chauffage, ventilation et climatisation),
• Protéger les objets de valeur et sécuriser la propriété.
• Les objets de valeur laissés derrière seront conservés pendant 1 mois avant d'être éliminés. Le Propriétaire/Gestionnaire n'est pas responsable des objets perdus ou endommagés.

17. ÉQUIPEMENTS INCLUS
Le Propriétaire/Gestionnaire fournit des draps, vaisselle, ustensiles de cuisine et consommables de base disponibles lors de l'enregistrement.

18. PANNES & FORCE MAJEURE
Aucun remboursement ne sera effectué pour les interruptions de :
• Électricité,
• Eau,
• Internet,
• Conditions météorologiques,
• Départ anticipé.
• Si une panne empêche l'enregistrement, tous les frais seront remboursés conformément aux dispositions de remboursement de ce contrat.

19. CONSOMMATION D'ÉLECTRICITÉ
L'utilisation standard et raisonnable de l'électricité est incluse.
Une consommation excessive ou anormale peut être facturée au Locataire/Voyageur en fonction des relevés des compteurs ou des factures de services publics.
Les frais peuvent être déduits du dépôt de sécurité ou facturés séparément.

20. SÉCURITÉ AU BORD DU LAC
Le Locataire/Voyageur doit superviser les mineurs près du lac.
Aucune barrière n'est installée et des risques de chute existent.
Le Locataire/Voyageur assume l'entière responsabilité ; le Propriétaire/Gestionnaire n'en assume aucune.

21. RÈGLES DE LA PISCINE, DU SAUNA & DU SPA
Si applicable à la propriété :
• Les enfants doivent être supervisés par un adulte responsable (25+) près du bord du lac, de la piscine, du sauna ou du spa.
• Les portes de la piscine doivent rester fermées à tout moment.
• Les portes du sauna doivent rester fermées à tout moment.
• Le spa doit être couvert lorsqu'il n'est pas utilisé ; une attention particulière doit être portée lors de l'opération du couvercle.
• Le non-respect peut entraîner la résiliation et la responsabilité des dommages.

22. FOYER EXTÉRIEUR
Les feux ne doivent pas être laissés sans surveillance.
Les feux doivent être complètement éteints avant de quitter ou de se coucher.
Les directives municipales de sécurité incendie doivent être respectées.
Si une interdiction de feu est émise, toute activité de feu doit cesser immédiatement.
La violation peut entraîner la résiliation, la perte de paiements ou des pénalités légales.

23. CHEMINÉE INTÉRIEURE
Les feux ne doivent pas être laissés sans surveillance.
Les feux doivent être complètement éteints avant de quitter ou de se coucher.
Les directives municipales de sécurité incendie doivent être respectées.

24. ARMES À FEU
Les armes à feu sont strictement interdites sur ou près de la propriété.

25. LOI APPLICABLE
Ce contrat est régi par les lois en vigueur dans la localité de la propriété.

26. ACCEPTATION DES CONDITIONS
En signant ci-dessous, le Locataire/Voyageur reconnaît avoir lu, compris et accepté toutes les conditions.
Signature du Locataire/Voyageur : ___________________________
Date : _______________
Signature du Propriétaire/Gestionnaire : _________________________
Date : _______________`;

export default function StepContract({ data, onUpdate, onNext, onBack }: StepContractProps) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'approved' | 'changes_requested' | null>(data?.status || null);
    const [comments, setComments] = useState(data?.comments || '');

    const handleStatusChange = (newStatus: 'approved' | 'changes_requested') => {
        setStatus(newStatus);
        onUpdate({
            status: newStatus,
            comments: newStatus === 'approved' ? '' : comments,
            reviewedAt: new Date().toISOString()
        });
    };

    const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComments(e.target.value);
        if (status === 'changes_requested') {
            onUpdate({
                status: 'changes_requested',
                comments: e.target.value,
                reviewedAt: new Date().toISOString()
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t('contract.title')}</h3>
                <p className={styles.subtitle}>{t('contract.subtitle')}</p>
            </div>

            <div className={styles.content}>
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f9f9f9',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                }}>
                    {CONTRACT_TEXT}
                </div>

                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <a
                        href="/contracts/contract_template.docx"
                        download="Management_Contract.docx"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#0066cc',
                            fontWeight: 'bold',
                            textDecoration: 'underline'
                        }}
                    >
                        📄 {t('contract.download')}
                    </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: status === 'approved' ? '#f0f9ff' : 'transparent',
                        borderColor: status === 'approved' ? '#0066cc' : '#eee'
                    }}>
                        <input
                            type="radio"
                            name="contractStatus"
                            checked={status === 'approved'}
                            onChange={() => handleStatusChange('approved')}
                        />
                        <span style={{ fontWeight: 500 }}>{t('contract.approve')}</span>
                    </label>

                    <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        padding: '1rem',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: status === 'changes_requested' ? '#fff9f0' : 'transparent',
                        borderColor: status === 'changes_requested' ? '#f59e0b' : '#eee'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="radio"
                                name="contractStatus"
                                checked={status === 'changes_requested'}
                                onChange={() => handleStatusChange('changes_requested')}
                            />
                            <span style={{ fontWeight: 500 }}>{t('contract.request_changes')}</span>
                        </div>

                        {status === 'changes_requested' && (
                            <textarea
                                className={styles.textarea}
                                placeholder={t('contract.comments_placeholder')}
                                value={comments}
                                onChange={handleCommentsChange}
                                style={{ marginTop: '0.5rem', minHeight: '120px' }}
                            />
                        )}
                    </label>
                </div>
            </div>

            <div className={styles.footer}>
                <Button onClick={onBack} variant="outline">{t('step.back')}</Button>
                <Button onClick={onNext} disabled={!status}>{t('dash.completed')}</Button>
            </div>
        </div>
    );
}
