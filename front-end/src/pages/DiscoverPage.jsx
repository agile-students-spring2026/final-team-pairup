import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscoverCard from "../components/discover/DiscoverCard";
import FilterBar from "../components/discover/FilterBar";
import EmptyFilteredState from "../components/discover/EmptyFilteredState";
import EmptyAlgorithmState from "../components/discover/EmptyAlgorithmState";
import { fetchDiscoverUsers } from "../services/mockApi";
import "../styles/discover.css";

function DiscoverPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isAlgorithmEmpty, setIsAlgorithmEmpty] = useState(false);

  function handleViewProfile(userId) {
    navigate(`/profile/${userId}`);
  }

  useEffect(() => {
    fetchDiscoverUsers().then((data) => {
      const sorted = [...data].sort(
        (a, b) => b.matchPercentage - a.matchPercentage
      );
      setUsers(sorted);
    });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch = selectedRole ? user.role === selectedRole : true;
      const levelMatch = selectedLevel ? user.level === selectedLevel : true;
      return roleMatch && levelMatch;
    });
  }, [users, selectedRole, selectedLevel]);

  function handleSendInvite(userId) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, invited: true } : user
      )
    );
  }

  function handleClearFilters() {
    setSelectedRole("");
    setSelectedLevel("");
  }

  function handleUpdatePreferences() {
    console.log("Go to preferences page");
  }

  const hasFilters = selectedRole || selectedLevel;

  return (
    <div className="discover-page">
      <div className="discover-header">
        <div>
          <h1 className="discover-title">Discover</h1>
          {!isAlgorithmEmpty && (
            <p className="discover-subtitle">
              {filteredUsers.length} match{filteredUsers.length !== 1 ? "es" : ""} found for you
            </p>
          )}
        </div>

        <button className="filter-pill-button">
          <span className="filter-icon">☷</span>
          <span>Filter</span>
        </button>
      </div>

      <FilterBar
        selectedRole={selectedRole}
        selectedLevel={selectedLevel}
        onRoleChange={setSelectedRole}
        onLevelChange={setSelectedLevel}
        onClearFilters={handleClearFilters}
      />

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
    </div>
  );
}

export default DiscoverPage;