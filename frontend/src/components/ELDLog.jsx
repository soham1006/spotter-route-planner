import { FileText, Truck, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";

const ROWS = [
  { key: "off_duty", label: "OFF DUTY" },
  { key: "sleeper", label: "SLEEPER BERTH" },
  { key: "driving", label: "DRIVING" },
  { key: "on_duty", label: "ON DUTY" },
];

const HOURS = Array.from({ length: 24 }, (_, index) => index);

function eventTypeToRow(type) {
  if (type === "driving") {
    return "driving";
  }

  if (
    type === "pickup" ||
    type === "dropoff" ||
    type === "fuel"
  ) {
    return "on_duty";
  }

  /*
   * The current HOS engine represents rest/break/restart
   * as off-duty events, so we do not incorrectly label them
   * as sleeper-berth time.
   */
  if (
    type === "break" ||
    type === "rest" ||
    type === "restart"
  ) {
    return "off_duty";
  }

  return "on_duty";
}

function formatHour(hour) {
  const totalMinutes = Math.round(hour * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}`;
}

function formatDuration(hours) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function ELDLog({ dailyLogs }) {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!dailyLogs || dailyLogs.length === 0) {
    return null;
  }

  const safeDay = Math.min(selectedDay, dailyLogs.length - 1);
  const selectedLog = dailyLogs[safeDay];

  const events = selectedLog.events || [];

  const totalDrivingHours = events
    .filter((event) => event.type === "driving")
    .reduce(
      (total, event) => total + event.duration_hours,
      0
    );

  const totalMiles = events.reduce(
    (total, event) => total + (event.distance_miles || 0),
    0
  );

  const totalHours = events.reduce(
    (total, event) => total + event.duration_hours,
    0
  );

  return (
    <section className="eld-section">
      <div className="section-header">
        <div>
          <div className="section-eyebrow">
            <FileText size={13} />
            DRIVER DAILY LOG
          </div>

          <h2>ELD / Record of Duty Status</h2>

          <p>
            24-hour duty-status record generated from the trip schedule.
          </p>
        </div>

        <div className="eld-compliance">
          <ShieldCheck size={14} />
          HOS record
        </div>
      </div>

      {/* DAY TABS */}
      <div className="eld-tabs">
        {dailyLogs.map((log, index) => (
          <button
            type="button"
            key={index}
            className={`eld-tab ${
              safeDay === index ? "active" : ""
            }`}
            onClick={() => setSelectedDay(index)}
          >
            Day {log.day}
          </button>
        ))}
      </div>

      <div className="eld-card">
        {/* LOG HEADER */}
        <div className="eld-log-header">
          <div className="eld-log-title">
            <div className="eld-document-icon">
              <FileText size={17} />
            </div>

            <div>
              <strong>Driver's Daily Log</strong>
              <span>One calendar day — 24 hours</span>
            </div>
          </div>

          <div className="eld-certification">
            <span>STATUS</span>
            <strong>Generated</strong>
          </div>
        </div>

        {/* REQUIRED LOG INFORMATION */}
        <div className="eld-meta">
          <div>
            <span>DATE</span>
            <strong>Trip Day {selectedLog.day}</strong>
          </div>

          <div>
            <span>TOTAL MILES DRIVING</span>
            <strong>{totalMiles.toFixed(1)} mi</strong>
          </div>

          <div>
            <span>TOTAL HOURS</span>
            <strong>{formatDuration(totalHours)}</strong>
          </div>

          <div>
            <span>DRIVING HOURS</span>
            <strong>{formatDuration(totalDrivingHours)}</strong>
          </div>

          <div>
            <span>VEHICLE</span>
            <strong>Trip Vehicle</strong>
          </div>

          <div>
            <span>CARRIER</span>
            <strong>Spotter Route Planner</strong>
          </div>
        </div>

        {/* 24-HOUR GRID */}
        <div className="eld-graph-wrapper">
          <div className="eld-hours">
            <div className="eld-corner">DUTY STATUS</div>

            {HOURS.map((hour) => (
              <span key={hour}>
                {hour === 0
                  ? "12"
                  : hour === 12
                  ? "12"
                  : hour > 12
                  ? hour - 12
                  : hour}
              </span>
            ))}
          </div>

          <div className="eld-grid">
            {ROWS.map((row) => (
              <div className="eld-row" key={row.key}>
                <div className="eld-label">{row.label}</div>

                <div className="eld-track">
                  {HOURS.map((hour) => (
                    <div
                      className="eld-hour"
                      key={hour}
                    />
                  ))}

                  {events
                    .filter(
                      (event) =>
                        eventTypeToRow(event.type) === row.key
                    )
                    .map((event, index) => {
                      const left =
                        (event.start_hour / 24) * 100;

                      const width =
                        ((event.end_hour -
                          event.start_hour) /
                          24) *
                        100;

                      return (
                        <div
                          key={`${event.type}-${index}`}
                          className={`eld-segment ${event.type}`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(
                              width,
                              0.25
                            )}%`,
                          }}
                          title={`${event.label} • ${formatDuration(
                            event.duration_hours
                          )}`}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEGEND */}
        <div className="eld-legend">
          <div>
            <span className="legend-box driving" />
            Driving
          </div>

          <div>
            <span className="legend-box on-duty" />
            On Duty — Not Driving
          </div>

          <div>
            <span className="legend-box off-duty" />
            Off Duty
          </div>

          <div>
            <span className="legend-box sleeper" />
            Sleeper Berth
          </div>
        </div>

        {/* REMARKS */}
        <div className="eld-remarks">
          <div className="eld-remarks-header">
            <span>TIME</span>
            <span>REMARKS / DUTY STATUS CHANGE</span>
          </div>

          {events.length === 0 ? (
            <div className="eld-remark">
              <span>—</span>
              <span>No recorded activity.</span>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                className="eld-remark"
                key={`${event.type}-remark-${index}`}
              >
                <span>
                  {formatHour(event.start_hour)}
                </span>

                <span>
                  {event.label}
                  {event.distance_miles > 0 &&
                    ` • ${event.distance_miles} mi`}
                </span>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="eld-footer">
          <div>
            <MapPin size={13} />
            <span>Route-based location records</span>
          </div>

          <div>
            <Truck size={13} />
            <span>Property-carrying operation</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ELDLog;