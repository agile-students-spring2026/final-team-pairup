import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { useProfile } from "../../context/ProfileContext";
import { BAND_KEYS, BAND_LABELS, DAYS, TIME_BANDS } from "../../utils/timezone";
import BottomNav from "../../components/button/BottomNav";

function ProfilePage({ onBackToEdit, successMessage }) {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        <div className="profile-top">
          <div className="avatar-circle">{initials}</div>

          <div className="top-info">
            <h1 className="profile-name">{profile.displayName}</h1>
            <p className="profile-subtitle">{profile.background}</p>

            {profile.linkedinUrl && (
              <a
                className="linkedin-link"
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="badge-row">
          <div className="mini-badge">{profile.sessions} Sessions</div>
          <div className="mini-badge">{profile.showUp} Show-up</div>
        </div>

        <hr className="divider" />

        <section className="profile-section">
          <h2 className="section-title">GOAL</h2>

          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-pill">
              {profile.targetRole === "Software Engineer" ? "SDE" : "PM"}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Practice focus</span>
            <div className="pill-group">
              <span className="info-pill">Coding</span>
              <span className="info-pill">Concepts</span>
            </div>
          </div>

          <div className="info-row">
            <span className="info-label">Target tier</span>
            <span className="plain-value">{profile.companyTier}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Timeline</span>
            <span className="plain-value">{profile.timeline}</span>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="section-title">LEVEL</h2>

          <div className="level-row">
            <span className="level-value">{profile.overallLevel}</span>
            <span className="level-dots">● ● ○</span>
          </div>
          <p className="muted-copy">
            {profile.overallLevel === "Beginner" &&
              "Primarily Easy problems / just getting started"}
            {profile.overallLevel === "Intermediate" &&
              "Medium problems as main focus / a few mocks done"}
            {profile.overallLevel === "Advanced" &&
              "Hard + OA-level / want to keep sharp"}
          </p>
          <div className="improve-row">
            <span className="info-label">Wants to improve:</span>
            <span className="accent-pill">{profile.wantsToImprove}</span>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="section-title">ABOUT</h2>
          <p className="about-copy">{profile.bio || "No bio added yet."}</p>
        </section>

        <section className="profile-section">
          <h2 className="section-title">WEEKLY AVAILABILITY</h2>

          <p className="timezone-line">
            Timezone:
            <span className="timezone-tabs">
              {["ET", "PT", "CT", "MT"].map((zone) => (
                <span
                  key={zone}
                  className={`timezone-static-pill ${
                    profile.timezone === zone
                      ? "timezone-static-pill--active"
                      : ""
                  }`}
                >
                  {zone}
                </span>
              ))}
            </span>
            <span className="tiny-copy">(your timezone)</span>
          </p>

          <div className="profile-grid">
            <div className="profile-grid-header" />
            {BAND_KEYS.map((band) => (
              <div key={band} className="profile-grid-header">
                <div className="profile-grid-title">{BAND_LABELS[band]}</div>
                <div className="profile-grid-subtitle">
                  {TIME_BANDS[profile.timezone][band]}
                </div>
              </div>
            ))}

            {DAYS.map((day) => (
              <React.Fragment key={day}>
                <div className="profile-day-label">{day}</div>
                {BAND_KEYS.map((band) => {
                  const active = profile.availability[day][band];
                  return (
                    <div
                      key={`${day}-${band}`}
                      className={`profile-slot ${
                        active ? "profile-slot--active" : ""
                      }`}
                    >
                      {active ? "✓" : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2 className="section-title">INTERVIEW ORDER</h2>
          <div className="plain-value">{profile.whoGoesFirst}</div>
        </section>

        <button
          className="edit-again-button"
          onClick={() => {
            if (onBackToEdit) onBackToEdit();
            else navigate("/profile/edit");
          }}
        >
          Edit Profile
        </button>

        <button
          className="edit-again-button"
          onClick={() => {
            navigate("/settings");
          }}
        >
          Settings
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;