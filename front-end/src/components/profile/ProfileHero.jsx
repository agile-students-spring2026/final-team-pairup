function ProfileHero({ user, onBack }) {
  return (
    <div className="profile-hero">
      <div className="profile-hero__topbar">
        <button className="profile-back-btn" onClick={onBack}>
          <svg className="profile-back-btn__icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M15 6L9 12L15 18" />
          </svg>
        </button>

        <span className="profile-match-badge">
          {typeof user.matchPercentage === "number" ? `${user.matchPercentage}%` : "N/A"} match
        </span>
      </div>

      <div className="profile-hero__main">
        <div className="profile-avatar">{user.initials}</div>

        <div className="profile-hero__info">
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-background-badge">{user.background}</div>

          {user.linkedin ? (
            <a
              className="profile-linkedin"
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              ↗ LinkedIn
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ProfileHero;