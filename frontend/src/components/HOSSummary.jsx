function HOSSummary({ hos }) {
  if (!hos) {
    return null;
  }

  const events = hos.events || [];

  const countEvents = (type) =>
    events.filter((event) => event.type === type).length;

  const cycleRemaining = Math.max(
    0,
    70 - hos.cycle_used_end
  );

  return (
    <section className="hos-summary-section">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">HOS SUMMARY</p>
          <h2>Hours of Service</h2>
        </div>
      </div>

      <div className="hos-stat-grid">
        <div className="hos-stat-card">
          <span>DRIVING</span>
          <strong>{hos.driving_hours.toFixed(2)} hrs</strong>
        </div>

        <div className="hos-stat-card">
          <span>TOTAL TRIP</span>
          <strong>{hos.total_hours.toFixed(2)} hrs</strong>
        </div>

        <div className="hos-stat-card">
          <span>CYCLE REMAINING</span>
          <strong>{cycleRemaining.toFixed(2)} hrs</strong>
        </div>
      </div>

      <div className="hos-events-summary">
        <div>
          <span>30-MIN BREAKS</span>
          <strong>{countEvents("break")}</strong>
        </div>

        <div>
          <span>10-HOUR RESTS</span>
          <strong>{countEvents("rest")}</strong>
        </div>

        <div>
          <span>FUEL STOPS</span>
          <strong>{countEvents("fuel")}</strong>
        </div>

        <div>
          <span>PICKUPS</span>
          <strong>{countEvents("pickup")}</strong>
        </div>

        <div>
          <span>DROPOFFS</span>
          <strong>{countEvents("dropoff")}</strong>
        </div>

        <div>
          <span>34-HOUR RESTARTS</span>
          <strong>{countEvents("restart")}</strong>
        </div>
      </div>
    </section>
  );
}

export default HOSSummary;