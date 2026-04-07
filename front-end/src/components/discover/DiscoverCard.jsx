import SharedGoalsBox from "./SharedGoalsBox";

function DiscoverCard({ user, onSendInvite, onViewProfile }) {
  const isExperienced = user.sessionsCompleted >= 3;
  const initials = user.displayName.split(' ').map(n => n[0]).join('');

  // inviteStatus: null → can invite, "sent" → already sent
  const isSent = user.inviteStatus === 'sent';

  return (
    <div className={`discover-card ${isSent ? "discover-card--disabled" : ""}`}>
      <div className="discover-card__top">
        <div className="discover-card__avatar">{initials}</div>

        <div className="discover-card__identity">
          <div className="discover-card__name-row">
            <h3 className="discover-card__name">{user.displayName}</h3>
            <span className="pill pill--neutral">{user.background}</span>
          </div>

          <div className="discover-card__match-row">
            <span className="pill pill--match">{user.matchPercent}% match</span>
          </div>
        </div>
      </div>

      <div className="discover-card__meta-row">
        {isExperienced ? (
          <>
            <span className="pill pill--soft">{user.sessionsCompleted} Sessions</span>
            <span className="pill pill--soft">{Math.round(user.showUpRate * 100)}% Show-up</span>
          </>
        ) : (
          <span className="pill pill--new">New to PairUp</span>
        )}
      </div>

      <div className="discover-card__tags">
        <span className="pill pill--tag">{user.role}</span>

        {user.practiceFocus.map((tag) => (
          <span key={tag} className="pill pill--tag">
            {tag}
          </span>
        ))}

        <span className="pill pill--tag">{user.level}</span>
        <span className="pill pill--tag">{user.targetTier}</span>
      </div>

      <SharedGoalsBox goals={user.sharedGoals} />

      <div className="discover-card__actions">
        <button
          className={`primary-btn ${isSent ? "primary-btn--sent" : ""}`}
          onClick={() => onSendInvite(user.userId)}
          disabled={isSent}
        >
          {isSent ? "Invite sent" : "Send invite"}
        </button>

        <button
          className="secondary-btn"
          onClick={() => onViewProfile(user.userId)}
        >
          View profile
        </button>
      </div>
    </div>
  );
}

export default DiscoverCard;
