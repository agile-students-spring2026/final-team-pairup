import React, { createContext, useContext, useMemo, useState } from "react";
import mockProfile from "../data/mockProfile.json";

const ProfileContext = createContext();

const defaultAvailability = {
  Mon: { AM: false, PM: false, EVE: false },
  Tue: { AM: false, PM: false, EVE: false },
  Wed: { AM: false, PM: false, EVE: false },
  Thu: { AM: false, PM: false, EVE: false },
  Fri: { AM: false, PM: false, EVE: false },
  Sat: { AM: false, PM: false, EVE: false },
  Sun: { AM: false, PM: false, EVE: false },
};

const DEFAULT_PROFILE = {
  displayName: mockProfile[0]?.displayName || "",
  targetRole: "Software Engineer",
  companyTier: "FAANG",
  timeline: "1–3 months",
  overallLevel: "Intermediate",
  background: "CS grad",
  bio: mockProfile[0]?.bio || "",
  linkedinUrl: mockProfile[0]?.linkedinUrl || "",
  timezone: "ET",
  availability: {
    ...defaultAvailability,
    Mon: { AM: true, PM: false, EVE: true },
    Tue: { AM: false, PM: true, EVE: true },
    Wed: { AM: false, PM: false, EVE: true },
  },
  whoGoesFirst: "No preference",
  sessions: 7,
  showUp: "100%",
  wantsToImprove: "Concepts",
  notifications: {
    newInvitation: mockProfile[0]?.notifications?.newInvitation ?? true,
    inviteAccepted: mockProfile[0]?.notifications?.inviteAccepted ?? true,
    sessionReminder: mockProfile[0]?.notifications?.sessionReminder ?? true,
  },
};

const STORAGE_KEY = "pairup_profile_data";

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [successMessage, setSuccessMessage] = useState("");

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAvailability = (day, band) => {
    setProfile((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [band]: !prev.availability[day][band],
        },
      },
    }));
  };

  const saveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSuccessMessage("Profile updated successfully.");
  };

  const clearSuccess = () => setSuccessMessage("");

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      updateField,
      toggleAvailability,
      saveProfile,
      successMessage,
      setSuccessMessage,
      clearSuccess,
    }),
    [profile, successMessage]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}