import { useState } from 'react';
import ReceivedTab from '../../components/matches/ReceivedTab';
import WaitingTab from '../../components/matches/WaitingTab';
import BottomNav from '../../components/button/BottomNav';
import './MatchesPage.css';

const TABS = [
  { id: 'received', label: 'Received' },
  { id: 'waiting', label: 'Invited & Waiting' },
];

function MatchesPage() {
  const [activeTab, setActiveTab] = useState('received');

  return (
    <div className="matches-page">
      <div className="matches-page__header">
        <h1 className="matches-page__title">Matches</h1>
      </div>

      {/* Tab bar */}
      <div className="matches-page__tab-bar" role="tablist" aria-label="Matches tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`matches-page__tab ${
              activeTab === tab.id ? 'matches-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        id="tabpanel-received"
        role="tabpanel"
        aria-labelledby="tab-received"
        hidden={activeTab !== 'received'}
        className="matches-page__panel"
      >
        {activeTab === 'received' && <ReceivedTab />}
      </div>

      <div
        id="tabpanel-waiting"
        role="tabpanel"
        aria-labelledby="tab-waiting"
        hidden={activeTab !== 'waiting'}
        className="matches-page__panel"
      >
        {activeTab === 'waiting' && <WaitingTab />}
      </div>

      <BottomNav active="matches" />
    </div>
  );
}

export default MatchesPage;
