import React from "react";
import "./ProfilePage.css";
import { useProfile } from "../context/ProfileContext";
import { BAND_KEYS, BAND_LABELS, DAYS, TIME_BANDS } from "../utils/timezone";

function ProfilePage({ onBackToEdit, successMessage }) {
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
          <span className="mini-badge">{profile.sessions} Sessions</span>
          <span className="mini-badge">{profile.showUp} Show-up</span>
        </div>

        <hr className="divider" />

        <section className="profile-section">
          <p className="section-title">GOAL</p>
          <div className="info-row">
            <span className="info-label">Role</span>
            <span className="info-pill">{profile.targetRole === "Software Engineer" ? "SDE" : "PM"}</span>
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
            <span className="info-pill">{profile.companyTier}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Timeline</span>
            <span className="plain-value">{profile.timeline}</span>
          </div>
        </section>

        <section className="profile-section">
          <p className="section-title">LEVEL</p>
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
          <p className="section-title">ABOUT</p>
          <p className="about-copy">{profile.bio || "No bio added yet."}</p>
        </section>

        <section className="profile-section">
          <p className="section-title">WEEKLY AVAILABILITY</p>
          <p className="timezone-line">
            Timezone:
            <span className="timezone-tabs">
              {["ET", "PT", "CT", "MT"].map((zone) => (
                <span
                  key={zone}
                  className={`timezone-static-pill ${
                    zone === profile.timezone ? "timezone-static-pill--active" : ""
                  }`}
                >
                  {zone}
                </span>
              ))}
            </span>
            <span className="tiny-copy">(your timezone)</span>
          </p>

          <div className="profile-grid">
            <div className="grid-header-empty" />
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
          <p className="section-title">INTERVIEW ORDER</p>
          <p className="about-copy">{profile.whoGoesFirst}</p>
        </section>

        <button className="edit-again-button" onClick={onBackToEdit}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;