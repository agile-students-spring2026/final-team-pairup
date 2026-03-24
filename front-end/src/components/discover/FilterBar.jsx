function FilterBar({
  selectedRole,
  selectedLevel,
  onRoleChange,
  onLevelChange,
  onClearFilters,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        <select value={selectedRole} onChange={(e) => onRoleChange(e.target.value)}>
          <option value="">All roles</option>
          <option value="SDE">SDE</option>
          <option value="PM">PM</option>
          <option value="Data">Data</option>
        </select>

        <select value={selectedLevel} onChange={(e) => onLevelChange(e.target.value)}>
          <option value="">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
        </select>
      </div>

      <button className="filter-button" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  );
}

export default FilterBar;