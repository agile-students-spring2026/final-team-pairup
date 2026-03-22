import { useMemo, useState } from 'react';
import PartnersList from './PartnersList';
import PartnerSpaceScreen from './PartnerSpaceScreen';
import { partnersMock } from '../data/partnersMock';
import './MainApp.css';

function MainApp({ partners = partnersMock }) {
  const [partnerSpaceId, setPartnerSpaceId] = useState(null);

  const partner = useMemo(
    () => partners.find((p) => p.id === partnerSpaceId),
    [partners, partnerSpaceId],
  );

  if (partnerSpaceId && partner) {
    return (
      <PartnerSpaceScreen
        key={partnerSpaceId}
        partner={partner}
        onBack={() => setPartnerSpaceId(null)}
        onDisconnect={() => setPartnerSpaceId(null)}
      />
    );
  }

  return (
    <div className="main-app app-shell">
      <main className="main-app__main">
        <div className="main-app__card app-shell__card app-shell__card--fill">
          <PartnersList partners={partners} onOpenPartner={setPartnerSpaceId} />
        </div>
      </main>
    </div>
  );
}

export default MainApp;
