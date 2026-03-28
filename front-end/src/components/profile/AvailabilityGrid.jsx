function AvailabilityGrid({ availability, selectedTimezone, onTimezoneChange }) {
  const days = Object.keys(availability.slots);
  const columns = [
    { key: "AM", label: "AM", sublabel: "8–12 ET" },
    { key: "PM", label: "PM", sublabel: "12–5 ET" },
    { key: "Eve", label: "Eve", sublabel: "5–10 ET" },
  ];

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">WEEKLY AVAILABILITY</h2>

      <div className="timezone-row">
        <span className="profile-label">Timezone:</span>

        <div className="timezone-toggle">
          {availability.timezoneOptions.map((tz) => (
            <button
              key={tz}
              type="button"
              className={`timezone-pill ${
                selectedTimezone === tz ? "timezone-pill--active" : ""
              }`}
              onClick={() => onTimezoneChange(tz)}
            >
              {tz}
            </button>
          ))}
        </div>

        <span className="timezone-note">{availability.viewerTimezoneLabel}</span>
      </div>

      <div className="availability-grid">
        <div className="availability-grid__header-spacer" />

        {columns.map((column) => (
          <div key={column.key} className="availability-grid__header">
            <div className="availability-grid__header-title">{column.label}</div>
            <div className="availability-grid__header-subtitle">
              {column.sublabel}
            </div>
          </div>
        ))}

        {days.map((day) => (
          <div className="availability-grid__row" key={day}>
            <div className="availability-grid__day">{day}</div>

            {columns.map((column) => {
              const active = availability.slots[day][column.key];

              return (
                <div
                  key={`${day}-${column.key}`}
                  className={`availability-cell ${
                    active ? "availability-cell--active" : ""
                  }`}
                >
                  {active ? "✓" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export default AvailabilityGrid;