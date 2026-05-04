import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/profile.css";
import "./EditProfileForm.css";
import { useProfile } from "../../context/ProfileContext";
import {
  BAND_KEYS,
  BAND_LABELS,
  DAYS,
  TIME_BANDS,
  TIMEZONE_OPTIONS,
} from "../../utils/timezone";

const roleOptions = ["Software Engineer", "Product Manager"];
const tierOptions = ["FAANG", "Mid-size tech", "Startup", "Any"];
const timelineOptions = [
  "< 1 month",
  "1–3 months",
  "3–6 months",
  "Just practicing",
];
const levelOptions = [
  {
    title: "Beginner",
    subtitle: "Primarily Easy problems / just getting started",
  },
  {
    title: "Intermediate",
    subtitle: "Medium problems as main focus / a few mocks done",
  },
  {
    title: "Advanced",
    subtitle: "Hard + OA-level / want to keep sharp",
  },
];
const backgroundOptions = [
  "CS undergrad",
  "CS grad",
  "Non-CS",
  "Bootcamp",
  "Self-taught",
];
const firstOptions = [
  "Go first as interviewee",
  "Go first as interviewer",
  "No preference",
];

function SelectChip({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      className={`select-chip ${active ? "select-chip--active" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditProfileForm({ onSuccess }) {
  const navigate = useNavigate();
  const { profile, updateField, toggleAvailability, saveProfile } = useProfile();
  const [errors, setErrors] = useState({});

  const selectedSlotsCount = useMemo(() => {
    return Object.values(profile.availability).reduce((count, daySlots) => {
      return count + Object.values(daySlots).filter(Boolean).length;
    }, 0);
  }, [profile.availability]);

  const handleSave = () => {
    const newErrors = {};

    if (!profile.displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    }

    if (!profile.targetRole) {
      newErrors.targetRole = "Please choose a target role.";
    }

    if (profile.bio.length > 150) {
      newErrors.bio = "Bio must be 150 characters or fewer.";
    }

    if (selectedSlotsCount < 3) {
      newErrors.availability = "Please select at least 3 availability slots.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    saveProfile();

    if (onSuccess) onSuccess();
    else navigate("/profile/me");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">
        <div className="edit-profile-card__topbar">
          <button
            type="button"
            className="profile-back-btn edit-profile-back-btn"
            onClick={() => navigate("/profile/me")}
            aria-label="Back to profile"
          >
            <svg
              className="profile-back-btn__icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path d="M15 6L9 12L15 18" />
            </svg>
          </button>
        </div>
        <div className="edit-profile-header">
          <p className="eyebrow">PAIRUP PROFILE</p>
          <h1>Build your interview profile</h1>
          <p className="header-copy">
            Help us match you with the right prep partner based on goals,
            schedule, and level.
          </p>
        </div>

        <div className="form-body">
          <section className="section-block">
            <label className="field-label">
              Display name <span className="required">*</span>
            </label>
            <p className="field-hint">
              Your real name — helps partners recognize you
            </p>
            <input
              className="text-input"
              type="text"
              value={profile.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              placeholder="Your real name — helps partners recognize you"
            />
            {errors.displayName && (
              <p className="error-text">{errors.displayName}</p>
            )}
          </section>

          <section className="section-block">
            <label className="field-label">
              Target role <span className="required">*</span>
            </label>
            <p className="field-hint">
              So we match you with people practicing the same interview format
            </p>
            <div className="chip-row">
              {roleOptions.map((option) => (
                <SelectChip
                  key={option}
                  active={profile.targetRole === option}
                  onClick={() => updateField("targetRole", option)}
                >
                  {option}
                  <span className="chip-short">
                    {option === "Software Engineer" ? "SDE" : "PM"}
                  </span>
                </SelectChip>
              ))}
            </div>
            {errors.targetRole && (
              <p className="error-text">{errors.targetRole}</p>
            )}
          </section>

          <section className="section-block">
            <label className="field-label">Target company tier</label>
            <p className="field-hint">
              Helps us prioritize partners with similar ambitions
            </p>
            <div className="chip-row">
              {tierOptions.map((option) => (
                <SelectChip
                  key={option}
                  active={profile.companyTier === option}
                  onClick={() => updateField("companyTier", option)}
                >
                  {option}
                </SelectChip>
              ))}
            </div>
          </section>

          <section className="section-block">
            <label className="field-label">Timeline</label>
            <p className="field-hint">
              We’ll surface people with the same urgency
            </p>
            <div className="chip-row">
              {timelineOptions.map((option) => (
                <SelectChip
                  key={option}
                  active={profile.timeline === option}
                  onClick={() => updateField("timeline", option)}
                >
                  {option}
                </SelectChip>
              ))}
            </div>
          </section>

          <section className="section-block">
            <label className="field-label">
              Overall level <span className="required">*</span>
            </label>
            <p className="field-hint">
              So your partner knows what to expect
            </p>

            <div className="level-stack">
              {levelOptions.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className={`level-card ${
                    profile.overallLevel === item.title
                      ? "level-card--active"
                      : ""
                  }`}
                  onClick={() => updateField("overallLevel", item.title)}
                >
                  <div className="level-title">{item.title}</div>
                  <div className="level-subtitle">{item.subtitle}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="section-block">
            <label className="field-label">Background</label>
            <p className="field-hint">
              Context helps partners set expectations
            </p>
            <div className="chip-row">
              {backgroundOptions.map((option) => (
                <SelectChip
                  key={option}
                  active={profile.background === option}
                  onClick={() => updateField("background", option)}
                >
                  {option}
                </SelectChip>
              ))}
            </div>
          </section>

          <section className="section-block">
            <label className="field-label">Bio</label>
            <p className="field-hint">
              Shown as-is to your potential partners (optional)
            </p>
            <textarea
              className="bio-input"
              value={profile.bio}
              onChange={(e) => updateField("bio", e.target.value.slice(0, 150))}
              placeholder="A quick intro — e.g. 'Ex-intern at AWS, grinding LeetCode daily'"
            />
            <div className="counter-row">
              <span />
              <span className="char-counter">{profile.bio.length}/150</span>
            </div>
            {errors.bio && <p className="error-text">{errors.bio}</p>}
          </section>

          <section className="section-block">
            <label className="field-label">LinkedIn URL</label>
            <p className="field-hint">
              Shown on your profile so partners can verify experience (optional)
            </p>
            <input
              className="text-input"
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://www.linkedin.com/in/yourname"
            />
          </section>

          <section className="section-block">
            <div className="availability-header">
              <div>
                <label className="field-label">
                  Weekly availability <span className="required">*</span>
                </label>
                <p className="field-hint">Select at least 3 time slots</p>
                <p className="detected-text">Detected: America/New_York</p>
              </div>
              <div className="slot-count">
                {selectedSlotsCount} selected (min 3)
              </div>
            </div>

            <div className="timezone-row">
              <span className="timezone-label">Timezone:</span>
              <div className="timezone-toggle">
                {TIMEZONE_OPTIONS.map((zone) => (
                  <button
                    type="button"
                    key={zone}
                    className={`timezone-pill ${
                      profile.timezone === zone ? "timezone-pill--active" : ""
                    }`}
                    onClick={() => updateField("timezone", zone)}
                  >
                    {zone}
                  </button>
                ))}
              </div>
              <span className="your-timezone">(your timezone)</span>
            </div>

            <div className="availability-grid">
              <div className="grid-header-empty" />
              {BAND_KEYS.map((band) => (
                <div key={band} className="grid-header">
                  <div className="grid-header-title">{BAND_LABELS[band]}</div>
                  <div className="grid-header-subtitle">
                    {TIME_BANDS[profile.timezone][band]}
                  </div>
                </div>
              ))}

              {DAYS.map((day) => (
                <React.Fragment key={day}>
                  <div className="day-label">{day}</div>
                  {BAND_KEYS.map((band) => {
                    const active = profile.availability[day][band];
                    return (
                      <button
                        type="button"
                        key={`${day}-${band}`}
                        className={`availability-cell ${
                          active ? "availability-cell--active" : ""
                        }`}
                        onClick={() => toggleAvailability(day, band)}
                      >
                        {active ? "✓" : ""}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {errors.availability && (
              <p className="error-text">{errors.availability}</p>
            )}
          </section>

          <section className="section-block">
            <p className="section-kicker">SHOWN TO YOUR MATCHES</p>
            <label className="field-label">
              Who goes first <span className="required">*</span>
            </label>
            <p className="field-hint">Your preferred interview order</p>

            <div className="first-choice-stack">
              {firstOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`first-choice ${
                    profile.whoGoesFirst === option
                      ? "first-choice--active"
                      : ""
                  }`}
                  onClick={() => updateField("whoGoesFirst", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <button type="button" className="next-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileForm;