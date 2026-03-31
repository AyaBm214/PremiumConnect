import React from 'react';
import { PartyPopper } from 'lucide-react';

const FinishBanner: React.FC = () => {
  return (
    <div className="pb-finish-banner">
      <div className="pb-finish-icon">
        <PartyPopper size={48} className="mb-4 text-pb-red" />
      </div>
      <h2 className="pb-finish-title">Onboarding complété avec succès !</h2>
      <p className="pb-finish-text">
        Toutes les étapes ont été validées. Votre bien est désormais prêt à accueillir ses premiers voyageurs VIP avec Premium Booking.
      </p>
    </div>
  );
};

export default FinishBanner;
