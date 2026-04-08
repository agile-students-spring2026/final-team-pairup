import { useState, useEffect, useCallback } from 'react';
import { formatRelativeAgo } from '../../utils/relativeTime';
import { getReceivedInvites, acceptInvite, declineInvite } from '../../services/mockApi';
import AcceptCelebration from './AcceptCelebration';
import './ReceivedTab.css';

/** Format ms remaining into "46h left", "2h left", "45m left", "Expired". */
function formatTimeLeft(expiresAt, nowMs = Date.now()) {
  const diff = expiresAt - nowMs;
  if (diff <= 0) return 'Expired';
  const totalMin = Math.floor(diff / 60000);
  if (totalMin < 60) return `${totalMin}m left`;
  const hrs = Math.floor(totalMin / 60);
  return `${hrs}h left`;
}

function InviteCard({ invite, onAccept, onDecline }) {
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
  const timeLeft = formatTimeLeft(invite.expiresAt);
  const expiringSoon = invite.expiresAt - Date.now() < 12 * 60 * 60 * 1000;

  async function handleAccept() {
    setBusy(true);
    try {
      await acceptInvite(invite.id);
      onAccept(invite);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    setBusy(true);
    try {
      await declineInvite(invite.id);
      setDeclined(true);
      // Show "[Name] isn't available right now" briefly, then remove
      setTimeout(() => onDecline(invite.id), 1800);
    } catch {
      setBusy(false);
    }
  }

  if (declined) {
    return (
      <div className="received-card received-card--dismissed" aria-live="polite">
        <p className="received-card__dismissed-msg">
          {invite.senderName} isn&apos;t available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="received-card">
      <div className="received-card__header">
        <img
          className="received-card__avatar"
          src={`https://picsum.photos/seed/${invite.avatarSeed}/96/96`}
          alt={invite.senderName}
          width={48}
          height={48}
        />
        <div className="received-card__identity">
          <span className="received-card__name">{invite.senderName}</span>
          <span className="received-card__meta">
            {invite.role} · {invite.tier} · {invite.background}
          </span>
        </div>
        <div className={`received-card__score ${expiringSoon ? 'received-card__score--dim' : ''}`}>
          {invite.kind === 'friend' ? (
            <>
              <span className="received-card__score-num received-card__score-num--friend">Friend</span>
              <span className="received-card__score-label">request</span>
            </>
          ) : (
            <>
              <span className="received-card__score-num">{invite.matchScore}%</span>
              <span className="received-card__score-label">match</span>
            </>
          )}
        </div>
      </div>

      <p className="received-card__bio">{invite.bio}</p>

      <div className="received-card__tags">
        {invite.practiceFocus.map((tag) => (
          <span key={tag} className="received-card__tag">{tag}</span>
        ))}
      </div>

      {invite.availabilityOverlap.length > 0 && (
        <p className="received-card__overlap">
          <span className="received-card__overlap-label">Overlap: </span>
          {invite.availabilityOverlap.join(', ')}
        </p>
      )}

      <div className="received-card__footer">
        <span
          className={`received-card__expiry ${expiringSoon ? 'received-card__expiry--urgent' : ''}`}
        >
          {timeLeft}
        </span>
        <span className="received-card__sent-ago">
          Sent {formatRelativeAgo(invite.sentAt)}
        </span>
      </div>

      <div className="received-card__actions">
        <button
          type="button"
          className="received-card__btn received-card__btn--decline"
          onClick={handleDecline}
          disabled={busy}
          aria-label={`Decline invite from ${invite.senderName}`}
        >
          Decline
        </button>
        <button
          type="button"
          className="received-card__btn received-card__btn--accept"
          onClick={handleAccept}
          disabled={busy}
          aria-label={`Accept invite from ${invite.senderName}`}
        >
          {busy ? 'Accepting…' : 'Accept'}
        </button>
      </div>
    </div>
  );
}

function ReceivedTab() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(null); // { partnerName }

  useEffect(() => {
    getReceivedInvites().then((data) => {
      setInvites(data);
      setLoading(false);
    });
  }, []);

  const handleAccept = useCallback((invite) => {
    setCelebrating({ partnerName: invite.senderName });
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
  }, []);

  const handleDecline = useCallback((id) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleCelebrationDone = useCallback(() => {
    setCelebrating(null);
  }, []);

  if (loading) {
    return (
      <div className="received-tab received-tab--loading" aria-busy="true">
        <div className="received-tab__spinner" aria-label="Loading invites" />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="received-tab received-tab--empty">
        <div className="received-tab__empty-inner">
          <div className="received-tab__empty-icon" aria-hidden="true">✉</div>
          <h2 className="received-tab__empty-title">No invites yet</h2>
          <p className="received-tab__empty-copy">
            When someone sends you a match invite it will appear here. Explore
            the Discover tab to find partners — they may invite you back.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {celebrating && (
        <AcceptCelebration
          partnerName={celebrating.partnerName}
          onDone={handleCelebrationDone}
        />
      )}
      <ul className="received-tab" aria-label="Received invites">
        {invites.map((invite) => (
          <li key={invite.id} className="received-tab__item">
            <InviteCard
              invite={invite}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export default ReceivedTab;
