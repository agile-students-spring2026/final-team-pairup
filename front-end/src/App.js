import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import DiscoverPage from "./pages/discover/DiscoverPage";
import UserProfilePage from "./pages/profile/UserProfilePage";
// Like this, we can import other pages as needed in the future
// Ryan / Saun / Eddie
// import EditProfilePage from "./pages/settings/EditProfilePage";
// import MatchPreferencesPage from "./pages/settings/MatchPreferencesPage";
// import RequestsListPage from "./pages/requests/RequestsListPage";
// import ChatBoardPage from "./pages/chat/ChatBoardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />

        {/* Ryan / Saun / Eddie* Like this/}
        {/* <Route path="/edit-profile" element={<EditProfilePage />} /> */}
        {/* <Route path="/match-preferences" element={<MatchPreferencesPage />} /> */}
        {/* <Route path="/requests" element={<RequestsListPage />} /> */}
        {/* <Route path="/chat" element={<ChatBoardPage />} /> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;