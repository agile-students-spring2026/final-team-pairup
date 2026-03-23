import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);

  const [newInvitation, setNewInvitation] = useState(true);
  const [inviteAccepted, setInviteAccepted] = useState(true);
  const [sessionReminder, setSessionReminder] = useState(true);

  const [displayName, setDisplayName] = useState('Jihun Kim');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  function toggleSection(name) {
    setOpenSection(openSection === name ? null : name);
  }

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
          <ExpandableRow
            title="Change display name"
            subtitle="Update the name shown to partners"
            isOpen={openSection === 'displayName'}
            onClick={() => toggleSection('displayName')}
          >
            <input
              className="settings-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
            />
            <button className="settings-action-btn" type="button">
              Update display name
            </button>
          </ExpandableRow>

          <ExpandableRow
            title="Change email"
            subtitle="Requires your current password"
            isOpen={openSection === 'email'}
            onClick={() => toggleSection('email')}
          >
            <input
              className="settings-input"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email"
            />
            <input
              className="settings-input"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Current password"
            />
            <button className="settings-action-btn" type="button">
              Update email
            </button>
          </ExpandableRow>

          <ExpandableRow
            title="Change password"
            subtitle="Requires your current password"
            isOpen={openSection === 'password'}
            onClick={() => toggleSection('password')}
          >
            <input
              className="settings-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <input
              className="settings-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
            />
            <button className="settings-action-btn" type="button">
              Update password
            </button>
          </ExpandableRow>

          <ExpandableRow
            title="Delete account"
            subtitle="Permanently removes all your data"
            isOpen={openSection === 'delete'}
            onClick={() => toggleSection('delete')}
            danger
          >
            <div className="danger-box">
              <strong>This is permanent and irreversible.</strong>
              <p>All your profile data, matches, and partner history will be deleted.</p>
            </div>

            <label className="delete-label">Type DELETE to confirm</label>
            <input
              className="settings-input"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
            <button
              className="settings-delete-btn"
              type="button"
              disabled={deleteConfirm !== 'DELETE'}
            >
              Permanently delete account
            </button>
          </ExpandableRow>
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
          <InfoRow title="Version" subtitle="1.0.0-demo" />
          <InfoRow
            title="Community guidelines"
            subtitle="How we expect everyone to behave on PairUp"
          />
          <InfoRow
            title="Privacy policy"
            subtitle="How we handle your data"
          />
        </div>
      </div>
    </div>
  );
}

function ExpandableRow({ title, subtitle, isOpen, onClick, danger = false, children }) {
  return (
    <div className="expandable-block">
      <div
        className="settings-row clickable-row"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="settings-row-text">
          <div className={`settings-row-title ${danger ? 'danger-text' : ''}`}>
            {title}
          </div>
          <div className="settings-row-subtitle">{subtitle}</div>
        </div>
        <div className="settings-row-right">{isOpen ? '⌄' : '›'}</div>
      </div>

      {isOpen && <div className="settings-expand-content">{children}</div>}
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