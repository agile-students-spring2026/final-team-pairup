import { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import OnboardingStepGoal from './components/OnboardingStepGoal';
import OnboardingStepLevel from './components/OnboardingStepLevel';
import OnboardingStepAvailability from './components/OnboardingStepAvailability';
import PartnersList from './components/PartnersList';
import PartnerSpaceScreen from './components/PartnerSpaceScreen';
import { PARTNERS_MOCK_NOW, partnersMock } from './data/partnersMock';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SettingsPage from './pages/settings/SettingsPage';
import './App.css';

function PartnerSpaceRoute({ partners, nowMs, onDisconnect }) {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const activePartner = partners.find((p) => p.id === partnerId);

  if (!activePartner) {
    return <Navigate to="/partners" replace />;
  }

  return (
    <PartnerSpaceScreen
      partner={activePartner}
      nowMs={nowMs}
      onBack={() => navigate('/partners')}
      onDisconnect={() => {
        onDisconnect(activePartner.id);
        navigate('/partners');
      }}
    />
  );
}

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/partners" replace />;
  }
  return children;
}

function AppRoutes({ initialIsAuthenticated = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [stepOneData, setStepOneData] = useState({});
  const [stepTwoData, setStepTwoData] = useState({});
  const [stepThreeData, setStepThreeData] = useState({});
  const [partners, setPartners] = useState(partnersMock);
  const nowMs = PARTNERS_MOCK_NOW;
  const navigate = useNavigate();

  const selectedPartnerIds = useMemo(() => new Set(partners.map((p) => p.id)), [partners]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/partners' : '/login'} replace />} />
      <Route
        path="/login"
        element={(
          <PublicOnlyRoute isAuthenticated={isAuthenticated}>
            <LoginPage
              onLoginSuccess={() => {
                setIsAuthenticated(true);
              }}
            />
          </PublicOnlyRoute>
        )}
      />
      <Route
        path="/register"
        element={(
          <PublicOnlyRoute isAuthenticated={isAuthenticated}>
            <RegisterPage
              onRegisterSuccess={() => {
                setIsAuthenticated(true);
              }}
            />
          </PublicOnlyRoute>
        )}
      />
      <Route
        path="/onboarding"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Navigate to="/onboarding/goal" replace />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/onboarding/goal"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepGoal
              initialValues={stepOneData}
              onNext={(payload) => {
                setStepOneData(payload);
                navigate('/onboarding/level');
              }}
            />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/onboarding/level"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepLevel
              stepOneData={stepOneData}
              initialValues={stepTwoData}
              onBack={(payload) => {
                setStepTwoData(payload);
                navigate('/onboarding/goal');
              }}
              onNext={(payload) => {
                setStepTwoData(payload);
                navigate('/onboarding/availability');
              }}
            />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/onboarding/availability"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <OnboardingStepAvailability
              initialValues={stepThreeData}
              onBack={(payload) => {
                setStepThreeData(payload);
                navigate('/onboarding/level');
              }}
              onComplete={(payload) => {
                setStepThreeData(payload);
                navigate('/partners');
              }}
            />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/partners"
        element={(
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
        )}
      />
      <Route
        path="/partners/:partnerId"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PartnerSpaceRoute
              partners={partners}
              nowMs={nowMs}
              onDisconnect={(partnerId) => {
                setPartners((prev) => prev.filter((p) => p.id !== partnerId));
              }}
            />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/settings"
        element={(
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SettingsPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/partners' : '/login'} replace />} />
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