import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SettingsPage from "./pages/settings/SettingsPage";
import DiscoverPage from "./pages/DiscoverPage";
import UserProfilePage from "./pages/UserProfilePage";
import PartnersList from "./pages/PartnersList";
import PartnerSpaceRoute from "./pages/PartnerSpaceRoute";
import OnboardingStepGoal from "./components/OnboardingStepGoal";
import OnboardingStepLevel from "./components/OnboardingStepLevel";
import OnboardingStepAvailability from "./components/OnboardingStepAvailability";

import ProfilePage from "./pages/ProfileEdit/ProfilePage";
import EditProfileForm from "./pages/ProfileEdit/EditProfileForm";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const params = useParams();

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // onboarding state
  const [stepOneData, setStepOneData] = useState(null);
  const [stepTwoData, setStepTwoData] = useState(null);
  const [stepThreeData, setStepThreeData] = useState(null);

  // sample partner data
  const [partners, setPartners] = useState([
    {
      id: "partner-1",
      name: "Alex Chen",
      role: "Software Engineer",
      companyTier: "FAANG",
      level: "Intermediate",
      bio: "Practicing medium / hard LC and system design.",
      connected: true,
      nextSessionAt: Date.now() + 1000 * 60 * 60 * 6,
    },
    {
      id: "partner-2",
      name: "Maya Singh",
      role: "Product Manager",
      companyTier: "Startup",
      level: "Advanced",
      bio: "Mock PM interviews and product sense practice.",
      connected: true,
      nextSessionAt: Date.now() + 1000 * 60 * 60 * 30,
    },
  ]);

  const nowMs = Date.now();

  const selectedPartnerIds = useMemo(() => {
    return new Set(partners.filter((p) => p.connected).map((p) => p.id));
  }, [partners]);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />

        {/* auth */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* onboarding */}
        <Route
          path="/onboarding/goal"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OnboardingStepGoal
                initialValues={stepOneData}
                onComplete={(payload) => {
                  setStepOneData(payload);
                  navigate("/onboarding/level");
                }}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/level"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OnboardingStepLevel
                initialValues={stepTwoData}
                onBack={() => navigate("/onboarding/goal")}
                onComplete={(payload) => {
                  setStepTwoData(payload);
                  navigate("/onboarding/availability");
                }}
              />
            </ProtectedRoute>
          }
        />

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

        {/* existing profile route in dev */}
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* your new profile routes */}
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
                  setPartners((prev) => prev.filter((p) => p.id !== partnerId))
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
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;