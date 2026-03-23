import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceivedTab from '../../components/matches/ReceivedTab';
import WaitingTab from '../../components/matches/WaitingTab';
import '../../styles/appShell.css';
import './MatchesPage.css';

const TABS = [
  { id: 'received', label: 'Received' },
  { id: 'waiting', label: 'Invited & Waiting' },
];

function MatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');

  return (
    <div className="app-shell">
      <div className="app-shell__card app-shell__card--fill matches-page">
        {/* Header */}
        <header className="matches-page__header">
          <button
            type="button"
            className="matches-page__back-btn"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 className="matches-page__title app-shell__title">Matches</h1>
          <div className="matches-page__header-spacer" aria-hidden="true" />
        </header>

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
      </div>
    </div>
  );
}

export default MatchesPage;
