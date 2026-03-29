import SharedGoalsBox from "./SharedGoalsBox";

function DiscoverCard({ user, onSendInvite, onViewProfile }) {
  const isExperienced = user.completedSessions >= 3;
  const isInvited = user.invited;

  return (
    <div className={`discover-card ${isInvited ? "discover-card--disabled" : ""}`}>
      <div className="discover-card__top">
        <div className="discover-card__avatar">{user.initials}</div>

        <div className="discover-card__identity">
          <div className="discover-card__name-row">
            <h3 className="discover-card__name">{user.name}</h3>
            <span className="pill pill--neutral">{user.track}</span>
          </div>

          <div className="discover-card__match-row">
            <span className="pill pill--match">{user.matchPercentage}% match</span>
          </div>
        </div>
      </div>

      <div className="discover-card__meta-row">
        {isExperienced ? (
          <>
            <span className="pill pill--soft">{user.completedSessions} Sessions</span>
            <span className="pill pill--soft">{user.showUpRate}% Show-up</span>
          </>
        ) : (
          <span className="pill pill--new">New to PairUp</span>
        )}
      </div>

      <div className="discover-card__tags">
        <span className="pill pill--tag">{user.role}</span>

        {user.focusTags.map((tag) => (
          <span key={tag} className="pill pill--tag">
            {tag}
          </span>
        ))}

        <span className="pill pill--tag">{user.level}</span>
        <span className="pill pill--tag">{user.companyTarget}</span>
      </div>

      <SharedGoalsBox goals={user.sharedGoals} />

      <div className="discover-card__actions">
        <button
          className={`primary-btn ${isInvited ? "primary-btn--sent" : ""}`}
          onClick={() => onSendInvite(user.id)}
          disabled={isInvited}
        >
          {isInvited ? "Invite sent" : "Send invite"}
        </button>

        <button
          className="secondary-btn"
          onClick={() => onViewProfile(user.id)}
        >
          View profile
        </button>
      </div>
    </div>
  );
}

export default DiscoverCard;