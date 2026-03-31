function FilterBar({
  selectedRole,
  selectedLevel,
  selectedCompany,
  onRoleChange,
  onLevelChange,
  onCompanyChange,
  onClearFilters,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="SDE">SDE</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Fullstack">Fullstack</option>
          <option value="Data">Data</option>
          <option value="ML">ML / AI</option>
          <option value="PM">PM</option>
          <option value="Designer">Designer</option>
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
        >
          <option value="">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
        >
          <option value="">All companies</option>
          <option value="FAANG">FAANG</option>
          <option value="Big Tech">Big Tech</option>
          <option value="Mid-size tech">Mid-size tech</option>
          <option value="Startups">Startups</option>
          <option value="Fintech">Fintech</option>
        </select>
      </div>

      <button className="filter-button" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  );
}

export default FilterBar;