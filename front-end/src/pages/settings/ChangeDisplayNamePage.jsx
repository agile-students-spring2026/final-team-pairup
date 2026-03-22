import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function ChangeDisplayNamePage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const canSubmit = displayName.trim().length > 1;

  function handleSubmit(e) {
    e.preventDefault();
    alert('Display name updated');
    navigate('/settings');
  }

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Change Display Name</h1>
        <p className="settings-subtitle">Update the name other users will see.</p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label>New display name</label>
          <input
            type="text"
            placeholder="Enter new display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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

export default ChangeDisplayNamePage;