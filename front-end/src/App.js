<<<<<<< HEAD
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SettingsPage from './pages/settings/SettingsPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DiscoverPage from "./pages/DiscoverPage";
import UserProfilePage from "./pages/UserProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
=======
import React, { useState } from "react";
import "./App.css";
import EditProfileForm from "./pages/ProfileEdit/EditProfileForm";
import ProfilePage from "./pages/ProfileEdit/ProfilePage";
import { useProfile } from "./context/ProfileContext";

function App() {
  const [currentView, setCurrentView] = useState("edit");
  const { successMessage, clearSuccess } = useProfile();

  const goToProfile = () => setCurrentView("profile");
  const goToEdit = () => {
    clearSuccess();
    setCurrentView("edit");
  };

  return (
    <div className="app-shell">
      {currentView === "edit" ? (
        <EditProfileForm onSuccess={goToProfile} />
      ) : (
        <ProfilePage
          onBackToEdit={goToEdit}
          successMessage={successMessage}
        />
      )}
    </div>
>>>>>>> master
  );
}

export default App;