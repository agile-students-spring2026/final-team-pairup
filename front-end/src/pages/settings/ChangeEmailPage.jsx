import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function ChangeEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const canSubmit = email.includes('@') && email.includes('.');

  function handleSubmit(e) {
    e.preventDefault();
    alert('Email updated');
    navigate('/settings');
  }

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Change Email</h1>
        <p className="settings-subtitle">Update the email address connected to your account.</p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label>New email</label>
          <input
            type="email"
            placeholder="your@nyu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

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

export default ChangeEmailPage;