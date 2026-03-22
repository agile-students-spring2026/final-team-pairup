import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SettingsPage from './pages/settings/SettingsPage';
import ChangeDisplayNamePage from './pages/settings/ChangeDisplayNamePage';
import ChangeEmailPage from './pages/settings/ChangeEmailPage';
import ChangePasswordPage from './pages/settings/ChangePasswordPage';
import DeleteAccountPage from './pages/settings/DeleteAccountPage';
import CommunityGuidelinesPage from './pages/settings/CommunityGuidelinesPage';
import PrivacyPolicyPage from './pages/settings/PrivacyPolicyPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/change-display-name" element={<ChangeDisplayNamePage />} />
      <Route path="/settings/change-email" element={<ChangeEmailPage />} />
      <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      <Route path="/settings/delete-account" element={<DeleteAccountPage />} />
      <Route path="/settings/community-guidelines" element={<CommunityGuidelinesPage />} />
      <Route path="/settings/privacy-policy" element={<PrivacyPolicyPage />} />
    </Routes>
  );
}

export default App;