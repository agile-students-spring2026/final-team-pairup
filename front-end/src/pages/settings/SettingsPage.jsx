import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "./SettingsPage.css";

function ChevronRow({ title, subtitle, danger = false, onClick }) {
  return (
    <button
      type="button"
      className={`settings-row ${danger ? "danger" : ""}`}
      onClick={onClick}
    >
      <div className="settings-row-text">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>
      <div className="settings-chevron">›</div>
    </button>
  );
}

function ToggleRow({ title, subtitle, checked, onToggle, disabled = false, badge }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <div className="settings-row-title">{title}</div>
        <div className="settings-row-subtitle">{subtitle}</div>
      </div>

      {badge ? (
        <div className="settings-pill">{badge}</div>
      ) : (
        <button
          type="button"
          className={`switch ${checked ? "on" : ""}`}
          onClick={onToggle}
          disabled={disabled}
          aria-label={title}
        >
          <span className="switch-knob" />
        </button>
      )}
    </div>
  );
}

function ExpandPanel({ open, children }) {
  if (!open) return null;
  return <div className="settings-expand">{children}</div>;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateField, saveProfile } = useProfile();

  const [openSection, setOpenSection] = useState(null);
  const [newEmail, setNewEmail] = useState(profile.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [message, setMessage] = useState("");

  function toggleSection(name) {
    setMessage("");
    setOpenSection((prev) => (prev === name ? null : name));
  }

  function handleDisplayNameSave() {
    saveProfile();
    setMessage("Display name updated.");
    setOpenSection(null);
  }

  function handleEmailSave() {
    if (!newEmail.trim() || !emailPassword.trim()) {
      setMessage("Enter your new email and current password.");
      return;
    }

    updateField("email", newEmail.trim());
    saveProfile();
    setEmailPassword("");
    setMessage("Email updated.");
    setOpenSection(null);
  }

  function handlePasswordSave() {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setMessage("Enter both current and new password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password updated.");
    setOpenSection(null);
  }

  function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setMessage('Type "DELETE" to confirm.');
      return;
    }

    setMessage("Account deletion requested.");
    setOpenSection(null);
  }

  function toggleNotification(key) {
    updateField("notifications", {
      ...profile.notifications,
      [key]: !profile.notifications?.[key],
    });
    saveProfile();
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <header className="settings-header">
          <button
            className="settings-back"
            type="button"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 className="settings-title">Settings</h1>
        </header>

        {message ? <div className="settings-message">{message}</div> : null}

        <section className="settings-section">
          <div className="settings-section-label">Account</div>

          <ChevronRow
            title="Change display name"
            subtitle="Update the name shown to partners"
            onClick={() => toggleSection("displayName")}
          />
          <ExpandPanel open={openSection === "displayName"}>
            <input
              className="settings-input"
              type="text"
              value={profile.displayName || ""}
              onChange={(e) => updateField("displayName", e.target.value)}
              placeholder="Display name"
            />
            <button
              className="settings-action-btn"
              type="button"
              onClick={handleDisplayNameSave}
            >
              Save
            </button>
          </ExpandPanel>

          <ChevronRow
            title="Change email"
            subtitle="Requires your current password"
            onClick={() => toggleSection("email")}
          />
          <ExpandPanel open={openSection === "email"}>
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
            <button
              className="settings-action-btn"
              type="button"
              onClick={handleEmailSave}
            >
              Save
            </button>
          </ExpandPanel>

          <ChevronRow
            title="Change password"
            subtitle="Requires your current password"
            onClick={() => toggleSection("password")}
          />
          <ExpandPanel open={openSection === "password"}>
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
              placeholder="New password"
            />
            <button
              className="settings-action-btn"
              type="button"
              onClick={handlePasswordSave}
            >
              Save
            </button>
          </ExpandPanel>

          <ChevronRow
            title="Delete account"
            subtitle="Permanently removes all your data"
            danger
            onClick={() => toggleSection("delete")}
          />
          <ExpandPanel open={openSection === "delete"}>
            <input
              className="settings-input"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE"'
            />
            <button
              className="settings-danger-btn"
              type="button"
              onClick={handleDeleteAccount}
            >
              Delete account
            </button>
          </ExpandPanel>
        </section>

        <section className="settings-section">
          <div className="settings-section-label">Notifications</div>

          <ToggleRow
            title="New invitation received"
            subtitle="When someone sends you a match invite"
            checked={!!profile.notifications?.newInvitation}
            onToggle={() => toggleNotification("newInvitation")}
          />

          <ToggleRow
            title="Invite accepted"
            subtitle="When your invite is accepted and a match is confirmed"
            checked={!!profile.notifications?.inviteAccepted}
            onToggle={() => toggleNotification("inviteAccepted")}
          />

          <ToggleRow
            title="Session reminder"
            subtitle="30 minutes before a scheduled session"
            checked={!!profile.notifications?.sessionReminder}
            onToggle={() => toggleNotification("sessionReminder")}
          />

          <ToggleRow
            title="Session booking confirmation"
            subtitle="Sent automatically when a session is booked — always on"
            badge="Always on"
          />
        </section>

        <section className="settings-section">
          <div className="settings-section-label">About</div>

          <div className="settings-row">
            <div className="settings-row-text">
              <div className="settings-row-title">Version</div>
              <div className="settings-row-subtitle">1.0.0-demo</div>
            </div>
          </div>

          <ChevronRow
  title="Community guidelines"
  subtitle="How we expect everyone to behave on PairUp"
  onClick={() => toggleSection("guidelines")}
/>
<ExpandPanel open={openSection === "guidelines"}>
  <p className="settings-paragraph">
    Be respectful, communicate honestly, show up on time, and support your
    partner’s learning. PairUp is meant to be a safe and professional space
    where everyone can practice, improve, and collaborate positively.
  </p>
</ExpandPanel>

          <ChevronRow
  title="Privacy policy"
  subtitle="How we handle your data"
  onClick={() => toggleSection("privacy")}
/>

<ExpandPanel open={openSection === "privacy"}>
  <p className="settings-paragraph">
    Your profile information is used only to support matching and core
    features of the PairUp platform. We do not share your personal data with
    external parties, and information is stored securely to protect your
    privacy while using the app.
  </p>
</ExpandPanel>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;