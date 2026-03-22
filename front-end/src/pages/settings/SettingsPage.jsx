import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

function SettingsPage() {
  const [newInvitation, setNewInvitation] = useState(true);
  const [inviteAccepted, setInviteAccepted] = useState(true);
  const [sessionReminder, setSessionReminder] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <header className="settings-header">
          <button
            className="back-btn"
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1>Settings</h1>
        </header>

        <div className="settings-section-title">ACCOUNT</div>

        <div className="settings-list">
          <SettingRow
            title="Change display name"
            subtitle="Update the name shown to partners"
            chevron
            onClick={() => navigate('/settings/change-display-name')}
          />
          <SettingRow
            title="Change email"
            subtitle="Requires your current password"
            chevron
            onClick={() => navigate('/settings/change-email')}
          />
          <SettingRow
            title="Change password"
            subtitle="Requires your current password"
            chevron
            onClick={() => navigate('/settings/change-password')}
          />
          <SettingRow
            title="Delete account"
            subtitle="Permanently removes all your data"
            chevron
            danger
            onClick={() => navigate('/settings/delete-account')}
          />
        </div>

        <div className="settings-section-title">NOTIFICATIONS</div>

        <div className="settings-list">
          <ToggleRow
            title="New invitation received"
            subtitle="When someone sends you a match invite"
            checked={newInvitation}
            onChange={() => setNewInvitation(!newInvitation)}
          />
          <ToggleRow
            title="Invite accepted"
            subtitle="When your invite is accepted and a match is confirmed"
            checked={inviteAccepted}
            onChange={() => setInviteAccepted(!inviteAccepted)}
          />
          <ToggleRow
            title="Session reminder"
            subtitle="30 minutes before a scheduled session"
            checked={sessionReminder}
            onChange={() => setSessionReminder(!sessionReminder)}
          />
          <StaticRow
            title="Session booking confirmation"
            subtitle="Sent automatically when a session is booked — always on"
            badge="Always on"
          />
        </div>

        <div className="settings-section-title">ABOUT</div>

        <div className="settings-list">
          <InfoRow
            title="Version"
            subtitle="1.0.0-demo"
          />
          <SettingRow
            title="Community guidelines"
            subtitle="How we expect everyone to behave on PairUp"
            chevron
            onClick={() => navigate('/settings/community-guidelines')}
          />
          <SettingRow
            title="Privacy policy"
            subtitle="How we handle your data"
            chevron
            onClick={() => navigate('/settings/privacy-policy')}
          />
        </div>
      </div>
    </div>
  );
}

function SettingRow({ title, subtitle, chevron = false, danger = false, onClick }) {
  const className = `settings-row ${onClick ? 'clickable-row' : ''}`;

  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="settings-row-text">
        <div className={`settings-row-title ${danger ? 'danger-text' : ''}`}>
          {title}
        </div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>
      {chevron && <div className="settings-row-right">›</div>}
    </div>
  );
}

function ToggleRow({ title, subtitle, checked, onChange }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider" />
      </label>
    </div>
  );
}

function StaticRow({ title, subtitle, badge }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>
      <div className="settings-badge">{badge}</div>
    </div>
  );
}

function InfoRow({ title, subtitle }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

export default SettingsPage;