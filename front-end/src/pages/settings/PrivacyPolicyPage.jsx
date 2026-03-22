import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Privacy Policy</h1>
        <p className="settings-subtitle">This page explains how PairUp handles your information.</p>

        <div className="info-section">
          <h2>Information we collect</h2>
          <p>We may collect your profile information, account details, preferences, and app activity.</p>

          <h2>How we use information</h2>
          <p>We use your data to help match users, improve the app, and support account functionality.</p>

          <h2>Sharing of information</h2>
          <p>We do not share personal data beyond what is needed for app features and platform operation.</p>

          <h2>Security</h2>
          <p>We aim to protect user information, but users should also protect their own login credentials.</p>

          <h2>Your choices</h2>
          <p>You can update your profile, change account information, or request account deletion.</p>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate('/settings')}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;