import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscoverCard from "../components/discover/DiscoverCard";
import FilterBar from "../components/discover/FilterBar";
import EmptyFilteredState from "../components/discover/EmptyFilteredState";
import EmptyAlgorithmState from "../components/discover/EmptyAlgorithmState";
import { fetchDiscoverUsers } from "../services/mockApi";
import BottomNav from "../components/button/BottomNav";

import "../styles/discover.css";

function DiscoverPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isAlgorithmEmpty, setIsAlgorithmEmpty] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDiscoverUsers().then((data) => {
      const sorted = [...data].sort(
        (a, b) => b.matchPercentage - a.matchPercentage
      );
      setUsers(sorted);
    });
  }, []);

  function handleViewProfile(userId) {
    navigate(`/profile/${userId}`);
  }

  function handleSendInvite(userId) {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, invited: true } : user
      )
    );
  }

  function handleClearFilters() {
    setSelectedRole("");
    setSelectedLevel("");
    setSelectedCompany("");
  }

  function handleUpdatePreferences() {
    console.log("Go to preferences page");
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      let roleMatch = true;

      if (selectedRole) {
        if (selectedRole === "SDE") {
          roleMatch = ["SDE", "Frontend", "Backend", "Fullstack"].includes(
            user.role
          );
        } else if (selectedRole === "ML") {
          roleMatch = ["ML", "Data"].includes(user.role);
        } else {
          roleMatch = user.role === selectedRole;
        }
      }

      const levelMatch = selectedLevel
        ? user.level === selectedLevel
        : true;

      const companyMatch = selectedCompany
        ? user.companyTarget === selectedCompany
        : true;

      return roleMatch && levelMatch && companyMatch;
    });
  }, [users, selectedRole, selectedLevel, selectedCompany]);

  const hasFilters =
    selectedRole !== "" || selectedLevel !== "" || selectedCompany !== "";

  return (
    <div className="discover-page">
      <div className="discover-header">
        <div>
          <h1 className="discover-title">Discover</h1>
          {!isAlgorithmEmpty && (
            <p className="discover-subtitle">
              {filteredUsers.length} match
              {filteredUsers.length !== 1 ? "es" : ""} found for you
            </p>
          )}
        </div>

        <button
          className="filter-pill-button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <span className="filter-icon">☷</span>
          <span>{showFilters ? "Hide Filters" : "Filter"}</span>
        </button>
      </div>

      {(selectedRole || selectedLevel || selectedCompany) && (
        <div className="active-filters">
          {selectedRole && (
            <span className="active-filter-chip">{selectedRole}</span>
          )}
          {selectedLevel && (
            <span className="active-filter-chip">{selectedLevel}</span>
          )}
          {selectedCompany && (
            <span className="active-filter-chip">{selectedCompany}</span>
          )}
        </div>
      )}

      {showFilters && (
        <FilterBar
          selectedRole={selectedRole}
          selectedLevel={selectedLevel}
          selectedCompany={selectedCompany}
          onRoleChange={setSelectedRole}
          onLevelChange={setSelectedLevel}
          onCompanyChange={setSelectedCompany}
          onClearFilters={handleClearFilters}
        />
      )}

      <div className="discover-debug-row">
        <button
          className="debug-toggle"
          onClick={() => setIsAlgorithmEmpty((prev) => !prev)}
        >
          Toggle algorithm empty state
        </button>
      </div>

      {isAlgorithmEmpty ? (
        <EmptyAlgorithmState
          notifyEnabled={notifyEnabled}
          onToggleNotify={() => setNotifyEnabled((prev) => !prev)}
          onUpdatePreferences={handleUpdatePreferences}
        />
      ) : filteredUsers.length === 0 && hasFilters ? (
        <EmptyFilteredState onClearFilters={handleClearFilters} />
      ) : (
        <div className="discover-feed">
          {filteredUsers.map((user) => (
            <DiscoverCard
              key={user.id}
              user={user}
              onSendInvite={handleSendInvite}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}

export default DiscoverPage;