function StickyInviteBar({ name, invited, onInvite }) {
  return (
    <div className="sticky-invite-bar">
      <button
        className={`sticky-invite-btn ${
          invited ? "sticky-invite-btn--sent" : ""
        }`}
        onClick={onInvite}
        disabled={invited}
      >
        {invited ? "✓ Invite sent" : `Send invite to ${name}`}
      </button>
    </div>
  );
}

export default StickyInviteBar;