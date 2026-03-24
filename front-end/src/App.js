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
  );
}

export default App;