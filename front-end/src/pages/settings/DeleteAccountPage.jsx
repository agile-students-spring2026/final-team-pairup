import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePages.css';

function DeleteAccountPage() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');

  const canDelete = confirmText === 'DELETE';

  function handleDelete(e) {
    e.preventDefault();
    alert('Account deleted');
    navigate('/login');
  }

  return (
    <div className="settings-page">
      <div className="settings-card danger-card">
        <h1>Delete Account</h1>
        <p className="settings-subtitle">
          This action cannot be undone. Type <strong>DELETE</strong> to confirm.
        </p>

        <form className="settings-form" onSubmit={handleDelete}>
          <label>Confirmation</label>
          <input
            type="text"
            placeholder='Type "DELETE"'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            required
          />

          <div className="settings-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/settings')}>
              Cancel
            </button>
            <button type="submit" className="danger-btn" disabled={!canDelete}>
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccountPage;