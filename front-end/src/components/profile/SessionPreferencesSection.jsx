function SessionPreferencesSection({ preferences }) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">SESSION PREFERENCES</h2>

      <div className="profile-field-row">
        <span className="profile-label">Format</span>
        <span className="profile-value">{preferences.format}</span>
      </div>

      <div className="profile-field-row">
        <span className="profile-label">Session length</span>
        <span className="profile-value">{preferences.sessionLength}</span>
      </div>

      <div className="profile-field-row">
        <span className="profile-label">Cadence</span>
        <span className="profile-value">{preferences.cadence}</span>
      </div>

      <div className="profile-field-column">
        <span className="profile-label">Notes</span>
        <span className="profile-value profile-value--multiline">
          {preferences.notes}
        </span>
      </div>
    </section>
  );
}

export default SessionPreferencesSection;