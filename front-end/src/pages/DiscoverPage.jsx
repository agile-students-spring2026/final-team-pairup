import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscoverCard from "../components/discover/DiscoverCard";
import FilterBar from "../components/discover/FilterBar";
import EmptyFilteredState from "../components/discover/EmptyFilteredState";
import EmptyAlgorithmState from "../components/discover/EmptyAlgorithmState";
import BottomNav from "../components/button/BottomNav";
import { fetchDiscoverUsers, getAuthHeaders } from "../services/mockApi";

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
    fetchDiscoverUsers()
      .then((matches) => {
        setUsers(matches || []);
      })
      .catch((err) => {
        console.error("Failed to fetch matches:", err);
        setUsers([]);
      });
  }, []);

  function handleViewProfile(user) {
    const targetId = user.userId || user.id || user._id;
    navigate(`/profile/${targetId}`, {
      state: {
        metrics: {
          matchPercent: user.matchPercent,
          sessionsCompleted: user.sessionsCompleted,
          showUpRate: user.showUpRate,
        },
      },
    });
  }

  async function handleSendInvite(targetUserId) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to send an invite.");
      }

      const res = await fetch(
        `/api/friends/requests`,
        {
          method: "POST",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            toUserId: targetUserId,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to send invite");
      }

      console.log("Friend request created:", data);

      setUsers((prev) =>
        prev.filter(
          (user) =>
            user.userId !== targetUserId &&
            user.id !== targetUserId &&
            user._id !== targetUserId
        )
      );

    } catch (err) {
      console.error("Failed to send invite:", err);
      alert(err.message || "Something went wrong");
    }
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
      const roleMatch = selectedRole ? user.role === selectedRole : true;
      const levelMatch = selectedLevel ? user.level === selectedLevel : true;
      const companyMatch = selectedCompany
        ? user.targetTier === selectedCompany
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
              {users.length} match
              {users.length !== 1 ? "es" : ""} found for you
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
              key={user.userId || user.id || user._id}
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