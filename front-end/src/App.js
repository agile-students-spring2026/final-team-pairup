import { useEffect, useMemo, useState } from "react";
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

import {
  PARTNERS_MOCK_NOW,
  PARTNERS_REFRESH_EVENT,
  fetchPartnersFromFriendsApi,
  getInitialPartners,
  mergePartnerRows,
} from "./services/mockApi";

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

function AppRoutes({ initialIsAuthenticated = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

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
                setIsAuthenticated(true);
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
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepGoal
              initialValues={stepOneData}
              onNext={(payload) => {
                setStepOneData(payload);
                navigate("/onboarding/level");
              }}
            />
          </ProtectedRoute>
        }
      />

      {/* onboarding step2 */}
      <Route
        path="/onboarding/level"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepLevel
              stepOneData={stepOneData}
              initialValues={stepTwoData}
              onBack={() => navigate("/onboarding/goal")}
              onNext={(payload) => {
                setStepTwoData(payload);
                navigate("/onboarding/availability");
              }}
            />
          </ProtectedRoute>
        }
      />

      {/* onboarding step3 */}
      <Route
        path="/onboarding/availability"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepAvailability
              initialValues={stepThreeData}
              onBack={() => navigate("/onboarding/level")}
              onComplete={(payload) => {
                setStepThreeData(payload);
                navigate("/discover");
              }}
            />
          </ProtectedRoute>
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