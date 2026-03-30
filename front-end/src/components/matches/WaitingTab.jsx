import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeAgo } from '../../utils/relativeTime';
import {
  getSentInvites,
  getMatchRecommendations,
  cancelSentInvite,
} from '../../services/mockApi';
import './WaitingTab.css';

/** Format ms remaining into "22h left", "45m left", "Expired". */
function formatTimeLeft(expiresAt, nowMs = Date.now()) {
  const diff = expiresAt - nowMs;
  if (diff <= 0) return 'Expired';
  const totalMin = Math.floor(diff / 60000);
  if (totalMin < 60) return `${totalMin}m left`;
  const hrs = Math.floor(totalMin / 60);
  return `${hrs}h left`;
}

function SentInviteCard({ invite, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const timeLeft = formatTimeLeft(invite.expiresAt);
  const expiringSoon = invite.expiresAt - Date.now() < 12 * 60 * 60 * 1000;
  const expired = invite.expiresAt <= Date.now();

  async function handleCancel() {
    setBusy(true);
    await cancelSentInvite(invite.id);
    setCancelled(true);
    setTimeout(() => onCancel(invite.id), 1600);
  }

  if (cancelled) {
    return (
      <div className="sent-card sent-card--dismissed" aria-live="polite">
        <p className="sent-card__dismissed-msg">Invite withdrawn.</p>
      </div>
    );
  }

  return (
    <div className={`sent-card ${expired ? 'sent-card--expired' : ''}`}>
      <div className="sent-card__header">
        <img
          className="sent-card__avatar"
          src={`https://picsum.photos/seed/${invite.avatarSeed}/96/96`}
          alt={invite.recipientName}
          width={48}
          height={48}
        />
        <div className="sent-card__identity">
          <span className="sent-card__name">{invite.recipientName}</span>
          <span className="sent-card__meta">
            {invite.role} · {invite.tier} · {invite.background}
          </span>
        </div>
        <div className={`sent-card__score ${expired ? 'sent-card__score--dim' : ''}`}>
          <span className="sent-card__score-num">{invite.matchScore}%</span>
          <span className="sent-card__score-label">match</span>
        </div>
      </div>

      <div className="sent-card__tags">
        {invite.practiceFocus.map((tag) => (
          <span key={tag} className="sent-card__tag">{tag}</span>
        ))}
      </div>

      <div className="sent-card__footer">
        <span
          className={`sent-card__expiry ${
            expired
              ? 'sent-card__expiry--expired'
              : expiringSoon
              ? 'sent-card__expiry--urgent'
              : ''
          }`}
        >
          {expired ? 'Expired' : timeLeft}
        </span>
        <span className="sent-card__sent-ago">
          Sent {formatRelativeAgo(invite.sentAt)}
        </span>
      </div>

      <button
        type="button"
        className="sent-card__cancel-btn"
        onClick={handleCancel}
        disabled={busy}
        aria-label={`Cancel invite sent to ${invite.recipientName}`}
      >
        {busy ? 'Withdrawing…' : 'Withdraw invite'}
      </button>
    </div>
  );
}

function RecommendationCard({ rec, onInvite }) {
  const [invited, setInvited] = useState(false);

  function handleInvite() {
    setInvited(true);
    onInvite(rec.id);
  }

  return (
    <div className="rec-card">
      <img
        className="rec-card__avatar"
        src={`https://picsum.photos/seed/${rec.avatarSeed}/96/96`}
        alt={rec.name}
        width={40}
        height={40}
      />
      <div className="rec-card__body">
        <span className="rec-card__name">{rec.name}</span>
        <span className="rec-card__meta">
          {rec.role} · {rec.tier} · {rec.background}
        </span>
      </div>
      <div className="rec-card__right">
        <span className="rec-card__score">{rec.matchScore}%</span>
        <button
          type="button"
          className={`rec-card__invite-btn ${invited ? 'rec-card__invite-btn--sent' : ''}`}
          onClick={handleInvite}
          disabled={invited}
          aria-label={invited ? `Invite sent to ${rec.name}` : `Send invite to ${rec.name}`}
        >
          {invited ? 'Sent' : 'Invite'}
        </button>
      </div>
    </div>
  );
}

function WaitingTab() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSentInvites(), getMatchRecommendations()]).then(
      ([inviteData, recData]) => {
        setInvites(inviteData);
        setRecs(recData);
        setLoading(false);
      },
    );
  }, []);

  const handleCancel = useCallback((id) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleInviteRec = useCallback(() => {
    // Optimistic — in a real app this would call sendInvite(id)
  }, []);

  if (loading) {
    return (
      <div className="waiting-tab waiting-tab--loading" aria-busy="true">
        <div className="waiting-tab__spinner" aria-label="Loading sent invites" />
      </div>
    );
  }

  return (
    <div className="waiting-tab">
      {invites.length === 0 ? (
        <div className="waiting-tab__empty">
          <div className="waiting-tab__empty-icon" aria-hidden="true">📬</div>
          <h2 className="waiting-tab__empty-title">No pending invites</h2>
          <p className="waiting-tab__empty-copy">
            Invites you send will appear here while you wait for a response.
          </p>
          <button
            type="button"
            className="waiting-tab__discover-btn"
            onClick={() => navigate('/discover')}
          >
            Find partners
          </button>
        </div>
      ) : (
        <ul className="waiting-tab__list" aria-label="Sent invites awaiting response">
          {invites.map((invite) => (
            <li key={invite.id} className="waiting-tab__item">
              <SentInviteCard invite={invite} onCancel={handleCancel} />
            </li>
          ))}
        </ul>
      )}

      {recs.length > 0 && (
        <section className="waiting-tab__recs" aria-labelledby="recs-heading">
          <h3 id="recs-heading" className="waiting-tab__recs-title">
            You might also like
          </h3>
          <ul className="waiting-tab__recs-list" aria-label="Recommended partners">
            {recs.map((rec) => (
              <li key={rec.id} className="waiting-tab__recs-item">
                <RecommendationCard rec={rec} onInvite={handleInviteRec} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default WaitingTab;
