import { useEffect, useState } from "react";
import { fetchUserById } from "../services/mockApi";
import ProfileHero from "../components/profile/ProfileHero";
import TrustSection from "../components/profile/TrustSection";
import GoalSection from "../components/profile/GoalSection";
import LevelSection from "../components/profile/LevelSection";
import AboutSection from "../components/profile/AboutSection";
import AvailabilityGrid from "../components/profile/AvailabilityGrid";
import SessionPreferencesSection from "../components/profile/SessionPreferencesSection";
import StickyInviteBar from "../components/profile/StickyInviteBar";
import "../styles/profile.css";
import { useParams } from "react-router-dom";

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState("ET");
  const { id } = useParams();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUserById(Number(id)).then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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