import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import "./SettingsPage.css";

const API_BASE = "http://localhost:3000";

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

function SettingsPage({ onLogout }) {
  const navigate = useNavigate();
  const { profile, updateField, saveProfile } = useProfile();

  const [openSection, setOpenSection] = useState(null);
  const [newEmail, setNewEmail] = useState(profile.email || localStorage.getItem("userEmail") || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentEmail = localStorage.getItem("userEmail") || profile.email || "";
  const currentDisplayName = profile.displayName || localStorage.getItem("fullName") || "";

  useEffect(() => {
    setNewEmail(currentEmail);
  }, [currentEmail]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!currentEmail) return;

      try {
        const response = await fetch(
          `${API_BASE}/api/settings/notifications?email=${encodeURIComponent(currentEmail)}`
        );
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        updateField("notifications", {
          newInvitation: data.newInvitationReceived ?? true,
          inviteAccepted: data.inviteAccepted ?? true,
          sessionReminder: data.sessionReminder ?? true,
          sessionBookingConfirmation: data.sessionBookingConfirmation ?? true,
        });
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    }

    fetchNotifications();
  }, [currentEmail, updateField]);

  function toggleSection(name) {
    setMessage("");
    setOpenSection((prev) => (prev === name ? null : name));
  }

  async function handleDisplayNameSave() {
    if (!currentEmail) {
      setMessage("No logged-in user found.");
      return;
    }

    if (!(profile.displayName || "").trim()) {
      setMessage("Enter a display name.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/api/settings/display-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          newDisplayName: profile.displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update display name.");
        return;
      }

      updateField("displayName", data.user.fullName);
      localStorage.setItem("fullName", data.user.fullName);
      saveProfile();
      setMessage("Display name updated.");
      setOpenSection(null);
    } catch (error) {
      console.error("Display name update error:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSave() {
    if (!newEmail.trim() || !emailPassword.trim()) {
      setMessage("Enter your new email and current password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/api/settings/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentEmail,
          currentPassword: emailPassword,
          newEmail: newEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update email.");
        return;
      }

      updateField("email", data.user.email);
      localStorage.setItem("userEmail", data.user.email);
      saveProfile();
      setEmailPassword("");
      setMessage("Email updated.");
      setOpenSection(null);
    } catch (error) {
      console.error("Email update error:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSave() {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setMessage("Enter both current and new password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/api/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated.");
      setOpenSection(null);
    } catch (error) {
      console.error("Password update error:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setMessage('Type "DELETE" to confirm.');
      return;
    }

    if (!deletePassword.trim()) {
      setMessage("Enter your current password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_BASE}/api/settings/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          currentPassword: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete account.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("fullName");
      localStorage.removeItem("sessionEmail");
      localStorage.removeItem("sessionFullName");
      localStorage.removeItem("pairup_profile_data");

      setMessage("Account deleted.");
      navigate("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleNotification(key) {
    if (!currentEmail) {
      setMessage("No logged-in user found.");
      return;
    }

    // Map profile keys (UI) to backend keys
    const current = {
      inviteReceived: !!profile.notifications?.newInvitation,
      matchConfirmed: !!profile.notifications?.inviteAccepted,
      sessionReminder: !!profile.notifications?.sessionReminder,
    };

    // key passed in is UI key (newInvitationReceived etc) — map to backend key
    const uiToBackend = {
      newInvitationReceived: "inviteReceived",
      inviteAccepted: "matchConfirmed",
      sessionReminder: "sessionReminder",
    };

    const backendKey = uiToBackend[key] || key;
    const updatedBackendNotifications = {
      ...current,
      [backendKey]: !current[backendKey],
    };

    try {
      const response = await fetch(`${API_BASE}/api/settings/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          notifications: updatedBackendNotifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update notifications.");
        return;
      }

      updateField("notifications", {
        newInvitation: data.notifications.newInvitationReceived ?? profile.notifications?.newInvitation,
        inviteAccepted: data.notifications.inviteAccepted ?? profile.notifications?.inviteAccepted,
        sessionReminder: data.notifications.sessionReminder ?? profile.notifications?.sessionReminder,
      });

      saveProfile();
      setMessage("Notification settings updated.");
    } catch (error) {
      console.error("Notification update error:", error);
      setMessage("Server error.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fullName");
    localStorage.removeItem("sessionEmail");
    localStorage.removeItem("sessionFullName");
    localStorage.removeItem("pairup_profile_data");

    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    navigate("/login");
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <header className="settings-header">
          <button
            className="settings-back"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg
              className="settings-back-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path d="M15 6L9 12L15 18" />
            </svg>
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
              value={currentDisplayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              placeholder="Display name"
            />
            <button
              className="settings-action-btn"
              type="button"
              onClick={handleDisplayNameSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
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
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
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
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
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
            <input
              className="settings-input"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
            />
            <button
              className="settings-danger-btn"
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete account"}
            </button>
          </ExpandPanel>

          <ChevronRow
            title="Log out"
            subtitle="Sign out of your PairUp account on this device"
            danger
            onClick={handleLogout}
          />
        </section>

        <section className="settings-section">
          <div className="settings-section-label">Notifications</div>

          <ToggleRow
            title="New invitation received"
            subtitle="When someone sends you a match invite"
            checked={!!profile.notifications?.newInvitation}
            onToggle={() => toggleNotification("newInvitationReceived")}
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