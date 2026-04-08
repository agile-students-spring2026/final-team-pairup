import { useMemo, useState } from "react";
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

import { PARTNERS_MOCK_NOW, getInitialPartners } from "./services/mockApi";

// ---------------------------------------------------------------------------
// Onboarding payload helpers
// ---------------------------------------------------------------------------

// Map step-1 role id → backend enum value
const ROLE_MAP = {
  sde: "SDE",
  pm: "PM",
};

// Map step-1 practiceFocus label → backend enum value
const PRACTICE_MAP = {
  "Algorithms & data structures": "Coding",
  "System design": "System Design",
  "Behavioral": "Behavioral",
  "Object-oriented design": "System Design", // closest match
  "Product sense": "Product Sense",
  "Execution & metrics": "Analytical",
  "Strategy & roadmap": "Analytical",
};

// Map step-1 companyTier id → backend enum value
const TIER_MAP = {
  faang: "FAANG",
  mid: "Mid-size tech",
  startup: "Startup",
  any: "Any",
};

// Map step-1 timeline id → backend enum value
const TIMELINE_MAP = {
  lt1m: "< 1 month",
  "1to3": "1-3 months",
  "3to6": "3-6 months",
  practice: "Just practicing",
};

// Map step-2 background id → backend enum value
const BACKGROUND_MAP = {
  cs_undergrad: "CS undergrad",
  cs_grad: "CS grad",
  non_cs: "Non-CS",
  bootcamp: "Bootcamp",
  self_taught: "Self-taught",
};

// Map step-3 whoGoesFirst id → backend enum value
const WHO_FIRST_MAP = {
  interviewee_first: "Go first as interviewee",
  interviewer_first: "Go first as interviewer",
  no_preference: "No preference",
};

// Map step-3 feedbackStyle id → backend enum value
const FEEDBACK_STYLE_MAP = {
  structured_notes: "Direct and critical",
  verbal_live: "Encouraging",
  mixed: "Balanced",
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

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
    // deduplicate (multiple front-end labels can map to same backend value)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const email = localStorage.getItem("userEmail") || undefined;
  const displayName = stepOne.displayName || localStorage.getItem("fullName") || "User";

  return {
    email,
    displayName,
    role,
    practiceFocus,
    targetTier: TIER_MAP[stepOne.companyTier] || "Any",
    timeline: TIMELINE_MAP[stepOne.timeline] || "Just practicing",
    level: stepTwo.level || "Intermediate",
    weakestArea: stepTwo.weakestArea ? (PRACTICE_MAP[stepTwo.weakestArea] || null) : null,
    background: BACKGROUND_MAP[stepTwo.background] || "CS grad",
    bio: stepTwo.bio || null,
    linkedinUrl: stepTwo.linkedInUrl || null,
    availability: slotsToAvailability(stepThree.availabilitySlots || []),
    whoGoesFirst: WHO_FIRST_MAP[stepThree.whoGoesFirst] || "No preference",
    feedbackStyle: FEEDBACK_STYLE_MAP[stepThree.feedbackStyle] || "Balanced",
  };
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
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [stepOneData, setStepOneData] = useState({});
  const [stepTwoData, setStepTwoData] = useState({});
  const [stepThreeData, setStepThreeData] = useState({});

  const [partners, setPartners] = useState(getInitialPartners);
  const nowMs = PARTNERS_MOCK_NOW;

  const navigate = useNavigate();

  const selectedPartnerIds = useMemo(
    () => new Set(partners.map((p) => p.id)),
    [partners]
  );

  /**
   * Called when the user finishes the last onboarding step.
   * Builds the full user-profile payload and POSTs it to the backend,
   * then navigates to /discover regardless of whether it succeeded
   * (the profile can be completed later from settings/edit-profile).
   */
  async function handleOnboardingComplete(threeData) {
    setStepThreeData(threeData);

    const payload = buildUserPayload(stepOneData, stepTwoData, threeData);

    if (payload) {
      try {
        const res = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.warn("POST /api/users failed:", err);
        }
      } catch (e) {
        console.warn("POST /api/users network error:", e);
      }
    }

    setIsAuthenticated(true);
    setIsOnboarding(false);
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
            <SettingsPage />
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

