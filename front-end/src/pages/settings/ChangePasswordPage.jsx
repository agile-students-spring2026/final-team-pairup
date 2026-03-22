import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    passwordsMatch;

  function handleSubmit(e) {
    e.preventDefault();
    alert('Password updated');
    navigate('/settings');
  }

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Change Password</h1>
        <p className="settings-subtitle">Choose a new password for your account.</p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label>Current password</label>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label>New password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirm new password</label>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="error-text">Passwords do not match.</p>
          )}

          <div className="settings-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/settings')}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={!canSubmit}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;