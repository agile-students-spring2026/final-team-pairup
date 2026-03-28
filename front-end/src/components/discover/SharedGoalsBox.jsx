function SharedGoalsBox({ goals }) {
  const visibleGoals = goals.slice(0, 3);

  return (
    <div className="shared-goals-box">
      <div className="shared-goals-title">
        {visibleGoals.length} shared goal{visibleGoals.length > 1 ? "s" : ""}
      </div>

      <ul className="shared-goals-list">
        {visibleGoals.map((goal, index) => (
          <li key={index}>{goal}</li>
        ))}
      </ul>
    </div>
  );
}

export default SharedGoalsBox;