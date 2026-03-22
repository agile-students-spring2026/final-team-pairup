import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function CommunityGuidelinesPage() {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Community Guidelines</h1>
        <p className="settings-subtitle">Please follow these guidelines to keep PairUp safe and useful.</p>

        <div className="info-section">
          <h2>Be respectful</h2>
          <p>Treat other users professionally and respectfully in all messages and interactions.</p>

          <h2>Be honest</h2>
          <p>Share accurate information about your background, interests, and availability.</p>

          <h2>No harassment</h2>
          <p>Harassment, discrimination, hate speech, or threatening behavior is not allowed.</p>

          <h2>Use PairUp for its purpose</h2>
          <p>PairUp is for mock interviews, prep partners, and professional collaboration.</p>

          <h2>Protect privacy</h2>
          <p>Do not share another person’s private information without their permission.</p>
        </div>

        <div className="settings-actions">
          <button type="button" className="primary-btn" onClick={() => navigate('/settings')}>
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityGuidelinesPage;