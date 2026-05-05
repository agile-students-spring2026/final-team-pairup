import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscoverCard from "../components/discover/DiscoverCard";
import FilterBar from "../components/discover/FilterBar";
import EmptyFilteredState from "../components/discover/EmptyFilteredState";
import EmptyAlgorithmState from "../components/discover/EmptyAlgorithmState";
import BottomNav from "../components/button/BottomNav";
import {
  fetchDiscoverBestMatches,
  fetchDiscoverRandomUsers,
  getAuthHeaders,
} from "../services/mockApi";
import { apiUrl } from "../config/apiBase";

import "../styles/discover.css";

function buildUserSearchHaystack(user) {
  const parts = [
    user.displayName,
    user.background,
    user.role,
    user.level,
    user.targetTier,
    user.school,
    user.bio,
    user.weakestArea,
    user.timeline,
    ...(Array.isArray(user.practiceFocus) ? user.practiceFocus : []),
    ...(Array.isArray(user.sharedGoals) ? user.sharedGoals : []),
  ];
  return parts
    .filter((p) => p != null && String(p).trim() !== "")
    .map((p) => String(p).toLowerCase())
    .join(" ");
}

function userMatchesSearchQuery(user, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const haystack = buildUserSearchHaystack(user);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

function DiscoverPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [listSource, setListSource] = useState("random");
  const listSourceRef = useRef("random");

  const loadDiscover = useCallback(() => {
    const source = listSourceRef.current;
    const fetcher =
      source === "random"
        ? fetchDiscoverRandomUsers
        : fetchDiscoverBestMatches;
    setIsLoadingMatches(true);
    return fetcher()
      .then((matches) => {
        setUsers(matches || []);
      })
      .catch((err) => {
        console.error("Failed to load discover list:", err);
        setUsers([]);
      })
      .finally(() => {
        setIsLoadingMatches(false);
      });
  }, []);

  useEffect(() => {
    listSourceRef.current = "random";
    loadDiscover();
  }, [loadDiscover]);

  function setDiscoverMode(next) {
    listSourceRef.current = next;
    setListSource(next);
    setIsLoadingMatches(true);
    const fetcher =
      next === "random" ? fetchDiscoverRandomUsers : fetchDiscoverBestMatches;
    fetcher()
      .then((matches) => {
        setUsers(matches || []);
      })
      .catch((err) => {
        console.error("Failed to load discover list:", err);
        setUsers([]);
      })
      .finally(() => {
        setIsLoadingMatches(false);
      });
  }

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
        apiUrl("/api/friends/requests"),
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
    setSearchQuery("");
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
      const searchMatch = userMatchesSearchQuery(user, searchQuery);

      return roleMatch && levelMatch && companyMatch && searchMatch;
    });
  }, [users, searchQuery, selectedRole, selectedLevel, selectedCompany]);

  const hasDropdownFilters =
    selectedRole !== "" || selectedLevel !== "" || selectedCompany !== "";
  const hasActiveConstraints =
    searchQuery.trim() !== "" || hasDropdownFilters;

  return (
    <div className="discover-page">
      <div className="discover-header">
        <div>
          <h1 className="discover-title">Discover</h1>
          <p className="discover-subtitle">
            {listSource === "random"
              ? hasActiveConstraints
                ? `Showing ${filteredUsers.length} of ${users.length} profiles`
                : `${users.length} random profile${users.length !== 1 ? "s" : ""}`
              : hasActiveConstraints
                ? `Showing ${filteredUsers.length} of ${users.length} matches`
                : `${users.length} best match${users.length !== 1 ? "es" : ""} for you`}
          </p>
        </div>

        <div className="discover-header__actions">
          {listSource === "random" ? (
            <button
              type="button"
              className="discover-best-match-button"
              onClick={() => setDiscoverMode("best")}
              disabled={isLoadingMatches}
            >
              Best matches
            </button>
          ) : (
            <button
              type="button"
              className="discover-random-browse-button"
              onClick={() => setDiscoverMode("random")}
              disabled={isLoadingMatches}
            >
              Random browse
            </button>
          )}
          <button
            type="button"
            className={`filter-pill-button${
              showFilters ? " filter-pill-button--active" : ""
            }`}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-pressed={showFilters}
          >
            <svg
              className="filter-pill-button__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 6h16M8 12h8M10 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{showFilters ? "Hide filters" : "Filters"}</span>
          </button>
        </div>
      </div>

      <div className="discover-search-wrap">
        <div className="discover-search">
          <label
            className="discover-search__field"
            htmlFor="discover-search-input"
          >
            <span className="discover-search__icon" aria-hidden>
              ⌕
            </span>
            <input
              id="discover-search-input"
              type="search"
              className="discover-search__input"
              placeholder="Search by name, role, company, skills…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
          </label>
          <button
            type="button"
            className="discover-search__refresh"
            onClick={() => loadDiscover()}
            disabled={isLoadingMatches}
            title={isLoadingMatches ? "Loading…" : "Reload list"}
            aria-label={
              isLoadingMatches ? "Loading matches" : "Reload match list"
            }
          >
            <svg
              className={
                isLoadingMatches ? "discover-search__refresh-svg--spinning" : ""
              }
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
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

      {filteredUsers.length === 0 && hasActiveConstraints ? (
        <EmptyFilteredState onClearFilters={handleClearFilters} />
      ) : users.length === 0 &&
        listSource === "best" &&
        !hasActiveConstraints ? (
        <EmptyAlgorithmState
          notifyEnabled={notifyEnabled}
          onToggleNotify={() => setNotifyEnabled((prev) => !prev)}
          onUpdatePreferences={handleUpdatePreferences}
        />
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