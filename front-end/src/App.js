import { useMemo, useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SettingsPage from "./pages/settings/SettingsPage";

import OnboardingStepGoal from "./components/OnboardingStepGoal";
import OnboardingStepLevel from "./components/OnboardingStepLevel";
import OnboardingStepAvailability from "./components/OnboardingStepAvailability";

import PartnersList from "./components/PartnersList";
import PartnerSpaceScreen from "./components/PartnerSpaceScreen";

import DiscoverPage from "./pages/DiscoverPage";
import UserProfilePage from "./pages/UserProfilePage";

import ProfilePage from "./pages/ProfileEdit/ProfilePage";
import EditProfileForm from "./pages/ProfileEdit/EditProfileForm";

import MatchesPage from "./pages/matches/MatchesPage";

import { PARTNERS_MOCK_NOW, PARTNERS_REFRESH_EVENT, fetchPartnersFromFriendsApi, getAuthHeaders, getInitialPartners, mergePartnerRows } from "./services/mockApi";
import { useProfile } from "./context/ProfileContext";

// ---------------------------------------------------------------------------
// Onboarding payload helpers
// ---------------------------------------------------------------------------

// step-1 role id → backend API value
const ROLE_MAP = { sde: "SDE", pm: "PM" };

// step-1 role id → ProfileContext UI value
const ROLE_UI_MAP = { sde: "Software Engineer", pm: "Product Manager" };

// step-1 practiceFocus label → backend API value
const PRACTICE_MAP = {
  "Algorithms & data structures": "Coding",
  "System design": "System Design",
  "Behavioral": "Behavioral",
  "Object-oriented design": "System Design",
  "Product sense": "Product Sense",
  "Execution & metrics": "Analytical",
  "Strategy & roadmap": "Analytical",
};

// step-1 companyTier id → backend API value (same as UI value)
const TIER_MAP = { faang: "FAANG", mid: "Mid-size tech", startup: "Startup", any: "Any" };

// step-1 timeline id → backend API value
const TIMELINE_API_MAP = {
  lt1m: "< 1 month",
  "1to3": "1-3 months",
  "3to6": "3-6 months",
  practice: "Just practicing",
};

// step-1 timeline id → ProfileContext UI value (uses em-dash)
const TIMELINE_UI_MAP = {
  lt1m: "< 1 month",
  "1to3": "1–3 months",
  "3to6": "3–6 months",
  practice: "Just practicing",
};

// step-2 background id → label (same for API and UI)
const BACKGROUND_MAP = {
  cs_undergrad: "CS undergrad",
  cs_grad: "CS grad",
  non_cs: "Non-CS",
  bootcamp: "Bootcamp",
  self_taught: "Self-taught",
};

// step-2 level id → capitalized label (same for API and UI)
const LEVEL_MAP = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

// step-3 whoGoesFirst id → label (same for API and UI)
const WHO_FIRST_MAP = {
  interviewee_first: "Go first as interviewee",
  interviewer_first: "Go first as interviewer",
  no_preference: "No preference",
};

// step-3 feedbackStyle id → API value
const FEEDBACK_STYLE_MAP = { structured_notes: "Direct and critical", verbal_live: "Encouraging", mixed: "Balanced" };

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const UI_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Convert the flat Set of slot keys ("mon-am", "tue-evening", …) that
 * OnboardingStepAvailability emits into the { mon: [bool,bool,bool], … }
 * shape that POST /api/users expects.
 */
function slotsToAvailability(availabilitySlots) {
  const slotSet = new Set(availabilitySlots);
  const result = {};
  for (const day of DAYS) {
    result[day] = [
      slotSet.has(`${day}-am`),
      slotSet.has(`${day}-pm`),
      slotSet.has(`${day}-evening`),
    ];
  }
  return result;
}

/**
 * Assemble the full POST /api/users payload from the three onboarding steps.
 * Returns null and logs a warning if required fields are missing.
 */
function buildUserPayload(stepOne, stepTwo, stepThree) {
  const role = ROLE_MAP[stepOne.role];
  if (!role) {
    console.warn("buildUserPayload: unknown role id", stepOne.role);
    return null;
  }

  const practiceFocus = (stepOne.practiceFocus || [])
    .map((label) => PRACTICE_MAP[label])
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // email MUST match what register stored — this is how upsert finds the stub
  const email = localStorage.getItem("userEmail") || localStorage.getItem("sessionEmail") || undefined;
  if (!email) {
    console.warn("buildUserPayload: no email in localStorage — upsert will fail");
  }
  // Prefer what user typed in onboarding step 1.
  // Fall back to the name from THIS session's register (stored separately),
  // never to a potentially-stale fullName from a previous session.
  const sessionName = localStorage.getItem("sessionFullName") || "";
  const displayName = stepOne.displayName || sessionName || "User";
  const availability = slotsToAvailability(stepThree.availabilitySlots || []);

  // API payload — uses backend enum values
  const apiPayload = {
    email,
    displayName,
    role,
    practiceFocus,
    targetTier: TIER_MAP[stepOne.companyTier] || "Any",
    timeline: TIMELINE_API_MAP[stepOne.timeline] || "Just practicing",
    level: LEVEL_MAP[stepTwo.level] || "Intermediate",
    weakestArea: stepTwo.weakestArea ? (PRACTICE_MAP[stepTwo.weakestArea] || null) : null,
    background: BACKGROUND_MAP[stepTwo.background] || "CS grad",
    bio: stepTwo.bio || null,
    linkedinUrl: stepTwo.linkedInUrl || null,
    availability,
    whoGoesFirst: WHO_FIRST_MAP[stepThree.whoGoesFirst] || "No preference",
    feedbackStyle: FEEDBACK_STYLE_MAP[stepThree.feedbackStyle] || "Balanced",
  };

  // ProfileContext cache — uses UI display values
  // This is what gets saved to localStorage so the profile page shows
  // the correct data immediately without needing the server.
  const uiProfile = {
    displayName,
    targetRole: ROLE_UI_MAP[stepOne.role] || "Software Engineer",
    companyTier: TIER_MAP[stepOne.companyTier] || "Any",
    timeline: TIMELINE_UI_MAP[stepOne.timeline] || "Just practicing",
    overallLevel: LEVEL_MAP[stepTwo.level] || "Intermediate",
    background: BACKGROUND_MAP[stepTwo.background] || "CS grad",
    bio: stepTwo.bio || "",
    linkedinUrl: stepTwo.linkedInUrl || "",
    timezone: "ET",
    whoGoesFirst: WHO_FIRST_MAP[stepThree.whoGoesFirst] || "No preference",
    wantsToImprove: stepTwo.weakestArea
      ? (PRACTICE_MAP[stepTwo.weakestArea] || stepTwo.weakestArea)
      : "",
    sessions: 0,
    showUp: "100%",
    notifications: { newInvitation: true, inviteAccepted: true, sessionReminder: true },
    // Convert flat slot keys → { Mon: {AM, PM, EVE}, ... } for ProfileContext
    availability: (() => {
      const slotSet = new Set(stepThree.availabilitySlots || []);
      const result = {};
      UI_DAYS.forEach((uiDay, i) => {
        const day = DAYS[i];
        result[uiDay] = {
          AM:  slotSet.has(`${day}-am`),
          PM:  slotSet.has(`${day}-pm`),
          EVE: slotSet.has(`${day}-evening`),
        };
      });
      return result;
    })(),
  };

  return { apiPayload, uiProfile };
}

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }
  return children;
}

function PartnerSpaceRoute({ partners, nowMs, onDisconnect }) {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const partner = partners.find((p) => p.id === partnerId);

  if (!partner) {
    return <Navigate to="/partners" replace />;
  }

  return (
    <PartnerSpaceScreen
      partner={partner}
      nowMs={nowMs}
      onBack={() => navigate("/partners")}
      onDisconnect={() => {
        onDisconnect(partner.id);
        navigate("/partners");
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// App routes
// ---------------------------------------------------------------------------

function AppRoutes({ initialIsAuthenticated = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (initialIsAuthenticated) return true;
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token"));
  });
  const [isOnboarding, setIsOnboarding] = useState(false);
  const { refetchProfile } = useProfile();

  const [stepOneData, setStepOneData] = useState({});
  const [stepTwoData, setStepTwoData] = useState({});
  const [stepThreeData, setStepThreeData] = useState({});

  const [partners, setPartners] = useState(getInitialPartners);
  const nowMs = PARTNERS_MOCK_NOW;

  const navigate = useNavigate();

  function clearLocalSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("fullName");
    localStorage.removeItem("sessionEmail");
    localStorage.removeItem("sessionFullName");
    localStorage.removeItem("pairup_profile_data");
  }

  function handleLogout({ redirectState } = {}) {
    clearLocalSession();
    setIsAuthenticated(false);
    setIsOnboarding(false);
    navigate("/login", { replace: true, state: redirectState });
  }

  const selectedPartnerIds = useMemo(
    () => new Set(partners.map((p) => p.id)),
    [partners]
  );

  // Teammate: merge friends/chat data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    function mergeFriendsFromApi() {
      fetchPartnersFromFriendsApi().then((rows) => {
        setPartners((prev) => mergePartnerRows(prev, rows));
      });
    }

    mergeFriendsFromApi();
    window.addEventListener(PARTNERS_REFRESH_EVENT, mergeFriendsFromApi);
    return () => window.removeEventListener(PARTNERS_REFRESH_EVENT, mergeFriendsFromApi);
  }, [isAuthenticated]);

  /**
   * Called when the user finishes the last onboarding step.
   * Builds the full user-profile payload and POSTs it to the backend,
   * then navigates to /discover regardless of whether it succeeded
   * (the profile can be completed later from settings/edit-profile).
   */
  async function handleOnboardingComplete(threeData) {
    setStepThreeData(threeData);

    const result = buildUserPayload(stepOneData, stepTwoData, threeData);
    if (!result) {
      setIsAuthenticated(true);
      setIsOnboarding(false);
      navigate("/discover");
      return;
    }

    const { apiPayload, uiProfile } = result;

    // Save to localStorage immediately — profile page works even without server
    localStorage.setItem("pairup_profile_data", JSON.stringify(uiProfile));

    // POST to backend (best-effort — don't block navigation if it fails)
    console.log("POST /api/users payload:", JSON.stringify(apiPayload, null, 2));
    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(apiPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.warn("POST /api/users failed:", err);
      }
    } catch (e) {
      console.warn("POST /api/users network error:", e);
    }

    setIsAuthenticated(true);
    setIsOnboarding(false);
    refetchProfile();
    navigate("/discover");
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/discover" : "/login"} />}
      />

      {/* login */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute isAuthenticated={isAuthenticated}>
            <LoginPage
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                navigate("/discover");
              }}
            />
          </PublicOnlyRoute>
        }
      />

      {/* register */}
      <Route
        path="/register"
        element={
          <PublicOnlyRoute isAuthenticated={isAuthenticated}>
            <RegisterPage
              onRegisterSuccess={() => {
                setIsOnboarding(true);
                navigate("/onboarding/goal");
              }}
            />
          </PublicOnlyRoute>
        }
      />

      {/* onboarding step1 */}
      <Route
        path="/onboarding/goal"
        element={
          isOnboarding ? (
            <OnboardingStepGoal
              initialValues={stepOneData}
              onNext={(payload) => {
                setStepOneData(payload);
                navigate("/onboarding/level");
              }}
            />
          ) : <Navigate to="/login" replace />
        }
      />

      {/* onboarding step2 */}
      <Route
        path="/onboarding/level"
        element={
          isOnboarding ? (
            <OnboardingStepLevel
              stepOneData={stepOneData}
              initialValues={stepTwoData}
              onBack={() => navigate("/onboarding/goal")}
              onNext={(payload) => {
                setStepTwoData(payload);
                navigate("/onboarding/availability");
              }}
            />
          ) : <Navigate to="/login" replace />
        }
      />

      {/* onboarding step3 — fires POST /api/users on complete */}
      <Route
        path="/onboarding/availability"
        element={
          isOnboarding ? (
            <OnboardingStepAvailability
              initialValues={stepThreeData}
              onBack={() => navigate("/onboarding/level")}
              onComplete={handleOnboardingComplete}
            />
          ) : <Navigate to="/login" replace />
        }
      />

      {/* discover */}
      <Route
        path="/discover"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DiscoverPage />
          </ProtectedRoute>
        }
      />

      {/* profile */}
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
          path="/profile/me"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditProfileForm />
            </ProtectedRoute>
          }
        />

      {/* Saun — Matches feature (Resolves #54, #55) */}
      <Route
        path="/matches"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MatchesPage />
          </ProtectedRoute>
        }
      />

      {/* partners */}
      <Route
        path="/partners"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PartnersList
              partners={partners}
              nowMs={nowMs}
              onOpenPartner={(partnerId) => {
                if (selectedPartnerIds.has(partnerId)) {
                  navigate(`/partners/${partnerId}`);
                }
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/partners/:partnerId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PartnerSpaceRoute
              partners={partners}
              nowMs={nowMs}
              onDisconnect={(partnerId) =>
                setPartners((prev) =>
                  prev.filter((p) => p.id !== partnerId)
                )
              }
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SettingsPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App({ initialIsAuthenticated = false }) {
  return (
    <BrowserRouter>
      <AppRoutes initialIsAuthenticated={initialIsAuthenticated} />
    </BrowserRouter>
  );
}

export default App;

