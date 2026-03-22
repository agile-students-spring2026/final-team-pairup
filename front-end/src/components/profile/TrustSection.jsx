function TrustSection({ user }) {
  const isExperienced = user.completedSessions >= 3;

  return (
    <div className="profile-section profile-trust-row">
      {isExperienced ? (
        <>
          <div className="profile-pill">{user.completedSessions} Sessions</div>
          <div className="profile-pill">{user.showUpRate}% Show-Up</div>
        </>
      ) : (
        <div className="profile-pill profile-pill--new">New to PairUp</div>
      )}
    </div>
  );
}

export default TrustSection;