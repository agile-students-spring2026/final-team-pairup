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
  );
}

export default App;