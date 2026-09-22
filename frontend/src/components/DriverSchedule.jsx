function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function DriverSchedule({ events }) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="schedule-section">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">DRIVER SCHEDULE</p>
          <h2>HOS Activity</h2>
        </div>
      </div>

      <div className="schedule-list">
        {events.map((event, index) => (
          <div className="schedule-item" key={index}>
            <div className="schedule-time">
              {formatHours(event.start_hour)}
              <span>→</span>
              {formatHours(event.end_hour)}
            </div>

            <div className={`schedule-status ${event.type}`}>
              <span className="status-dot" />
              <div>
                <strong>{event.label}</strong>

                <p>
                  {formatHours(event.duration_hours)}
                  {event.distance_miles > 0 &&
                    ` • ${event.distance_miles} mi`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DriverSchedule;