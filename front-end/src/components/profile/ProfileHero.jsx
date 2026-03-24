function ProfileHero({ user, onBack }) {
  return (
    <div className="profile-hero">
      <div className="profile-hero__topbar">
        <button className="profile-back-btn" onClick={onBack}>
          ← Discover
        </button>

        <span className="profile-match-badge">{user.matchPercentage}% match</span>
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