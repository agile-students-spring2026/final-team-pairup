import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthHeaders } from "../services/mockApi";
import { apiUrl } from "../config/apiBase";

const ProfileContext = createContext();

const STORAGE_KEY = "pairup_profile_data";

const PRACTICE_OPTIONS_BY_ROLE = {
  SDE: ["Coding", "System Design", "Behavioral"],
  PM: ["Product Sense", "Analytical", "Behavioral"],
};

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

function uiRoleToApiRole(targetRole) {
  return targetRole === "Product Manager" ? "PM" : "SDE";
}

function apiRoleToUiRole(role) {
  return role === "PM" ? "Product Manager" : "Software Engineer";
}

function getValidPracticeFocus(apiRole, currentWeakestArea) {
  const options = PRACTICE_OPTIONS_BY_ROLE[apiRole] || PRACTICE_OPTIONS_BY_ROLE.SDE;

  if (options.includes(currentWeakestArea)) {
    return [currentWeakestArea];
  }

  return [options[0]];
}

function getValidWeakestArea(apiRole, currentWeakestArea) {
  const practiceFocus = getValidPracticeFocus(apiRole, currentWeakestArea);
  return practiceFocus[0];
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
  return {
    mon: [
      !!uiAvailability.Mon?.AM,
      !!uiAvailability.Mon?.PM,
      !!uiAvailability.Mon?.EVE,
    ],
    tue: [
      !!uiAvailability.Tue?.AM,
      !!uiAvailability.Tue?.PM,
      !!uiAvailability.Tue?.EVE,
    ],
    wed: [
      !!uiAvailability.Wed?.AM,
      !!uiAvailability.Wed?.PM,
      !!uiAvailability.Wed?.EVE,
    ],
    thu: [
      !!uiAvailability.Thu?.AM,
      !!uiAvailability.Thu?.PM,
      !!uiAvailability.Thu?.EVE,
    ],
    fri: [
      !!uiAvailability.Fri?.AM,
      !!uiAvailability.Fri?.PM,
      !!uiAvailability.Fri?.EVE,
    ],
    sat: [
      !!uiAvailability.Sat?.AM,
      !!uiAvailability.Sat?.PM,
      !!uiAvailability.Sat?.EVE,
    ],
    sun: [
      !!uiAvailability.Sun?.AM,
      !!uiAvailability.Sun?.PM,
      !!uiAvailability.Sun?.EVE,
    ],
  };
}

function mapApiUserToProfile(apiUser) {
  return {
    displayName: apiUser.displayName || "",
    targetRole: apiRoleToUiRole(apiUser.role),
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

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedUserId = localStorage.getItem("lastProfileUserId");
    const currentUserId = localStorage.getItem("userId");

    if (saved && savedUserId && currentUserId && savedUserId !== currentUserId) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_PROFILE;
    }

    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetchProfile = useCallback(() => {
    setFetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const meUrl = userId
      ? apiUrl(`/api/users/me?userId=${userId}`)
      : apiUrl("/api/users/me");

    fetch(meUrl, {
      cache: "no-store",
      headers: getAuthHeaders(),
    })
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

        const uid = localStorage.getItem("userId");

        if (uid) {
          localStorage.setItem("lastProfileUserId", uid);
        }
      })
      .catch(() => {
        const savedName = localStorage.getItem("fullName");

        if (savedName) {
          setProfile((prev) => ({
            ...prev,
            displayName: savedName,
          }));
        }
      });
  }, [fetchTrigger]);

  const updateField = useCallback((field, value) => {
    setProfile((prev) => {
      if (field === "targetRole") {
        const apiRole = uiRoleToApiRole(value);
        const validWeakestArea = getValidWeakestArea(
          apiRole,
          prev.wantsToImprove
        );

        return {
          ...prev,
          targetRole: value,
          wantsToImprove: validWeakestArea,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
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
    const apiRole = uiRoleToApiRole(profile.targetRole);
    const practiceFocus = getValidPracticeFocus(
      apiRole,
      profile.wantsToImprove
    );
    const weakestArea = getValidWeakestArea(apiRole, profile.wantsToImprove);

    const payload = {
      displayName: profile.displayName,
      role: apiRole,
      practiceFocus,
      weakestArea,
      bio: profile.bio,
      linkedinUrl: profile.linkedinUrl || null,
      background: profile.background,
      whoGoesFirst: profile.whoGoesFirst,
      targetTier: profile.companyTier,
      level: profile.overallLevel,
      timeline: uiTimelineToApi(profile.timeline),
      timezone: uiTimezoneToApi(profile.timezone),
      availability: uiAvailabilityToApi(profile.availability),
    };

    const userId = localStorage.getItem("userId");

    const meUrl = userId
      ? apiUrl(`/api/users/me?userId=${userId}`)
      : apiUrl("/api/users/me");

    const res = await fetch(meUrl, {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
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
      refetchProfile,
    }),
    [
      profile,
      successMessage,
      updateField,
      toggleAvailability,
      saveProfile,
      clearSuccess,
      refetchProfile,
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