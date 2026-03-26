function LevelSection({ level }) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">LEVEL</h2>

      <div className="profile-level-main">
        <div className="profile-level-title-row">
          <span className="profile-level-text">{level.current}</span>

          <div className="profile-pips">
            {Array.from({ length: level.pipTotal }).map((_, index) => (
              <span
                key={index}
                className={`profile-pip ${
                  index < level.pipCount ? "profile-pip--active" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="profile-level-description">{level.description}</div>

        {level.weakestArea ? (
          <div className="profile-weakest-row">
            <span className="profile-label">Wants to improve:</span>
            <span className="profile-chip profile-chip--weak">
              {level.weakestArea}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default LevelSection;