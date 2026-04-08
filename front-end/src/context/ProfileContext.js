import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ProfileContext = createContext();

const STORAGE_KEY = "pairup_profile_data";

function createDefaultAvailability() {
  return {
    Mon: { AM: false, PM: false, EVE: false },
    Tue: { AM: false, PM: false, EVE: false },
    Wed: { AM: false, PM: false, EVE: false },
    Thu: { AM: false, PM: false, EVE: false },
    Fri: { AM: false, PM: false, EVE: false },
    Sat: { AM: false, PM: false, EVE: false },
    Sun: { AM: false, PM: false, EVE: false },
  };
}

const DEFAULT_PROFILE = {
  displayName: "",
  targetRole: "Software Engineer",
  companyTier: "FAANG",
  timeline: "1–3 months",
  overallLevel: "Intermediate",
  background: "CS grad",
  bio: "",
  linkedinUrl: "",
  timezone: "ET",
  availability: {
    ...createDefaultAvailability(),
    Mon: { AM: true, PM: false, EVE: true },
    Tue: { AM: false, PM: true, EVE: true },
    Wed: { AM: false, PM: false, EVE: true },
  },
  whoGoesFirst: "No preference",
  sessions: 0,
  showUp: "100%",
  wantsToImprove: "",
  notifications: {
    newInvitation: true,
    inviteAccepted: true,
    sessionReminder: true,
  },
};

function apiTimelineToUi(value) {
  if (value === "1-3 months") return "1–3 months";
  if (value === "3-6 months") return "3–6 months";
  return value;
}

function uiTimelineToApi(value) {
  if (value === "1–3 months") return "1-3 months";
  if (value === "3–6 months") return "3-6 months";
  return value;
}

function apiTimezoneToUi(value) {
  if (value === "America/Chicago") return "CT";
  if (value === "America/Los_Angeles") return "PT";
  return "ET";
}

function uiTimezoneToApi(value) {
  if (value === "CT") return "America/Chicago";
  if (value === "PT") return "America/Los_Angeles";
  return "America/New_York";
}

function apiAvailabilityToUi(apiAvailability = {}) {
  const result = createDefaultAvailability();

  const dayMap = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };

  Object.entries(apiAvailability).forEach(([apiDay, values]) => {
    const uiDay = dayMap[apiDay];
    if (!uiDay || !Array.isArray(values)) return;

    result[uiDay] = {
      AM: !!values[0],
      PM: !!values[1],
      EVE: !!values[2],
    };
  });

  return result;
}

function uiAvailabilityToApi(uiAvailability = {}) {
  const dayMap = {
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
    Sun: "sun",
  };

  const result = {};

  Object.entries(dayMap).forEach(([uiDay, apiDay]) => {
    const row = uiAvailability[uiDay] || {};
    result[apiDay] = [!!row.AM, !!row.PM, !!row.EVE];
  });

  return result;
}

function mapApiUserToProfile(apiUser) {
  return {
    displayName: apiUser.displayName || "",
    targetRole: apiUser.role === "PM" ? "Product Manager" : "Software Engineer",
    companyTier: apiUser.targetTier || "FAANG",
    timeline: apiTimelineToUi(apiUser.timeline || "1-3 months"),
    overallLevel: apiUser.level || "Intermediate",
    background: apiUser.background || "CS grad",
    bio: apiUser.bio || "",
    linkedinUrl: apiUser.linkedinUrl || "",
    timezone: apiTimezoneToUi(apiUser.timezone),
    availability: apiAvailabilityToUi(apiUser.availability),
    whoGoesFirst: apiUser.whoGoesFirst || "No preference",
    sessions: apiUser.sessionsCompleted ?? 0,
    showUp: `${Math.round((apiUser.showUpRate ?? 1) * 100)}%`,
    wantsToImprove: apiUser.weakestArea || "",
    notifications: {
      newInvitation: apiUser.notifications?.inviteReceived ?? true,
      inviteAccepted: apiUser.notifications?.matchConfirmed ?? true,
      sessionReminder: apiUser.notifications?.sessionReminder ?? true,
    },
  };
}

function mapProfileToPatchPayload(profile) {
  return {
    displayName: profile.displayName,
    role: profile.targetRole === "Product Manager" ? "PM" : "SDE",
    targetTier: profile.companyTier,
    timeline: uiTimelineToApi(profile.timeline),
    level: profile.overallLevel,
    background: profile.background,
    bio: profile.bio,
    linkedinUrl: profile.linkedinUrl || null,
    timezone: uiTimezoneToApi(profile.timezone),
    availability: uiAvailabilityToApi(profile.availability),
    whoGoesFirst: profile.whoGoesFirst,
    weakestArea: profile.wantsToImprove || null,
  };
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const meUrl = userId ? `/api/users/me?userId=${userId}` : "/api/users/me";
    fetch(meUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const nextProfile = mapApiUserToProfile(data.user);
        setProfile(nextProfile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
      })
      .catch(() => {
        // keep localStorage fallback
      });
  }, []);

  const updateField = useCallback((field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const toggleAvailability = useCallback((day, band) => {
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
  }, []);

  const saveProfile = useCallback(async () => {
    const payload = {
      displayName: profile.displayName,
      bio: profile.bio,
      linkedinUrl: profile.linkedinUrl || null,
      background: profile.background,
      whoGoesFirst: profile.whoGoesFirst,
      targetTier: profile.companyTier,
      level: profile.overallLevel,
      timeline:
        profile.timeline === "1–3 months"
          ? "1-3 months"
          : profile.timeline === "3–6 months"
          ? "3-6 months"
          : profile.timeline,
      availability: {
        mon: [!!profile.availability.Mon?.AM, !!profile.availability.Mon?.PM, !!profile.availability.Mon?.EVE],
        tue: [!!profile.availability.Tue?.AM, !!profile.availability.Tue?.PM, !!profile.availability.Tue?.EVE],
        wed: [!!profile.availability.Wed?.AM, !!profile.availability.Wed?.PM, !!profile.availability.Wed?.EVE],
        thu: [!!profile.availability.Thu?.AM, !!profile.availability.Thu?.PM, !!profile.availability.Thu?.EVE],
        fri: [!!profile.availability.Fri?.AM, !!profile.availability.Fri?.PM, !!profile.availability.Fri?.EVE],
        sat: [!!profile.availability.Sat?.AM, !!profile.availability.Sat?.PM, !!profile.availability.Sat?.EVE],
        sun: [!!profile.availability.Sun?.AM, !!profile.availability.Sun?.PM, !!profile.availability.Sun?.EVE],
      },
    };

    const userId = localStorage.getItem("userId");
    const meUrl = userId ? `/api/users/me?userId=${userId}` : "/api/users/me";
    const res = await fetch(meUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.details?.join(", ") ||
        errorData?.error ||
        `HTTP ${res.status}`
      );
    }

    const data = await res.json();
    const nextProfile = mapApiUserToProfile(data.user);

    setProfile(nextProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    setSuccessMessage("Profile updated successfully.");
  }, [profile]);

  const clearSuccess = useCallback(() => setSuccessMessage(""), []);

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
    [
      profile,
      successMessage,
      updateField,
      toggleAvailability,
      saveProfile,
      clearSuccess,
    ]
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