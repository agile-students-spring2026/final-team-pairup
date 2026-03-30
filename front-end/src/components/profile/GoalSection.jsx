function GoalSection({ goal }) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">GOAL</h2>

      <div className="profile-field-row">
        <span className="profile-label">Role</span>
        <span className="profile-chip">{goal.role}</span>
      </div>

      <div className="profile-field-row">
        <span className="profile-label">Practice focus</span>
        <div className="profile-chip-group">
          {goal.practiceFocus.map((item) => (
            <span key={item} className="profile-chip">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="profile-field-row">
        <span className="profile-label">Target tier</span>
        <span className="profile-chip">{goal.targetTier}</span>
      </div>

      <div className="profile-field-row">
        <span className="profile-label">Timeline</span>
        <span className="profile-value">{goal.timeline}</span>
      </div>
    </section>
  );
}

export default GoalSection;