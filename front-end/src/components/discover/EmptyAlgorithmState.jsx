function EmptyAlgorithmState({ notifyEnabled, onToggleNotify, onUpdatePreferences }) {
  return (
    <div className="empty-state-card">
      <div className="empty-illustration">✨</div>

      <div className="empty-state-title">We&apos;re finding your matches</div>

      <div className="empty-state-text">
        We&apos;re still generating the best candidates for your goals and availability.
      </div>

      <label className="notify-toggle">
        <input
          type="checkbox"
          checked={notifyEnabled}
          onChange={onToggleNotify}
        />
        <span>Notify me when matches are ready</span>
      </label>

      <button className="link-button" onClick={onUpdatePreferences}>
        Update your preferences
      </button>
    </div>
  );
}

export default EmptyAlgorithmState;