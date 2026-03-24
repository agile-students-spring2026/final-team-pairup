function EmptyFilteredState({ onClearFilters }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-title">No matches with these filters</div>
      <div className="empty-state-text">
        Try clearing your filters to see more compatible candidates.
      </div>
      <button className="primary-btn empty-state-btn" onClick={onClearFilters}>
        Clear filters
      </button>
    </div>
  );
}

export default EmptyFilteredState;