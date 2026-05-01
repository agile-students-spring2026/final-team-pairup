import { useEffect, useState } from "react";
import ProfileHero from "../components/profile/ProfileHero";
import TrustSection from "../components/profile/TrustSection";
import GoalSection from "../components/profile/GoalSection";
import LevelSection from "../components/profile/LevelSection";
import AboutSection from "../components/profile/AboutSection";
import AvailabilityGrid from "../components/profile/AvailabilityGrid";
import SessionPreferencesSection from "../components/profile/SessionPreferencesSection";
import StickyInviteBar from "../components/profile/StickyInviteBar";
import "../styles/profile.css";
import { useLocation, useParams } from "react-router-dom";
import { getAuthHeaders } from "../services/mockApi";

function toPercentValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const normalized = value <= 1 ? value * 100 : value;
  return Math.round(normalized);
}

function mapApiUserToProfile(apiUser, metrics = {}) {
  const showUpRateFromMetrics = toPercentValue(metrics.showUpRate);
  const showUpRateFromApi = toPercentValue(apiUser.showUpRate);
  const matchPercentage = toPercentValue(metrics.matchPercent);

  return {
    ...apiUser,

    initials: (apiUser.displayName || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase(),

    name: apiUser.displayName,
    linkedin: apiUser.linkedinUrl,
    matchPercentage,

    goal: {
      role: apiUser.role,
      practiceFocus: apiUser.practiceFocus,
      targetTier: apiUser.targetTier,
      timeline: apiUser.timeline,
    },

    level: {
      current: apiUser.level,
      weakestArea: apiUser.weakestArea,
      pipTotal: 3,
      pipCount:
        apiUser.level === "Beginner"
          ? 1
          : apiUser.level === "Intermediate"
          ? 2
          : 3,
      description: `${apiUser.level} level`,
    },

    about: apiUser.bio || "",

    availability: {
      slots: Object.fromEntries(
        Object.entries(apiUser.availability || {}).map(([day, [am, pm, eve]]) => [
          day,
          { AM: am, PM: pm, Eve: eve },
        ])
      ),
      timezoneOptions: ["ET", "CT", "PT"],
      viewerTimezoneLabel: "ET",
    },

    sessionPreferences: {
      format: apiUser.whoGoesFirst,
      sessionLength: "45 min",
      cadence: "Flexible",
      notes: apiUser.feedbackStyle,
    },

    completedSessions:
      typeof metrics.sessionsCompleted === "number"
        ? metrics.sessionsCompleted
        : apiUser.sessionsCompleted,
    showUpRate: showUpRateFromMetrics ?? showUpRateFromApi ?? 100,
    invited: false,
  };
}

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState("ET");
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
  
    setLoading(true);
  
    fetch(`/api/users/${id}`, { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          const navMetrics = location.state?.metrics || {};
          setUser(mapApiUserToProfile(data.user, navMetrics));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });
  
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  function handleInvite() {
    setUser((prev) => (prev ? { ...prev, invited: true } : null));
  }

  function handleBack() {
    window.history.back();
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page__content">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <div className="profile-page">User not found.</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-page__content">
        <ProfileHero user={user} onBack={handleBack} />
        <TrustSection user={user} />
        <GoalSection goal={user.goal} />
        <LevelSection level={user.level} />
        <AboutSection about={user.about} />
        <AvailabilityGrid
          availability={user.availability}
          selectedTimezone={selectedTimezone}
          onTimezoneChange={setSelectedTimezone}
        />
        <SessionPreferencesSection preferences={user.sessionPreferences} />
      </div>

      <StickyInviteBar
        name={user.name}
        invited={user.invited}
        onInvite={handleInvite}
      />
    </div>
  );
}

export default UserProfilePage;