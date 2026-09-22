import { ArrowUpRight, Flag, MapPin, Package } from "lucide-react";

function formatDistance(meters) {
  if (!meters) return "";

  const miles = meters / 1609.344;

  if (miles < 0.1) {
    return `${Math.round(meters)} m`;
  }

  return `${miles.toFixed(1)} mi`;
}

function formatInstruction(step) {
  const type = step?.maneuver?.type;
  const modifier = step?.maneuver?.modifier;
  const roadName = step?.name;

  if (type === "depart") {
    return roadName
      ? `Depart onto ${roadName}`
      : "Depart from current location";
  }

  if (type === "arrive") {
    return "Arrive at destination";
  }

  if (type === "roundabout" || type === "rotary") {
    return roadName
      ? `Enter roundabout toward ${roadName}`
      : "Enter roundabout";
  }

  if (type === "merge") {
    return roadName
      ? `Merge onto ${roadName}`
      : "Merge onto the route";
  }

  if (type === "fork") {
    return roadName
      ? `Take the fork toward ${roadName}`
      : "Take the appropriate fork";
  }

  if (type === "new name") {
    return roadName
      ? `Continue onto ${roadName}`
      : "Continue";
  }

  const directionMap = {
    left: "Turn left",
    right: "Turn right",
    straight: "Continue straight",
    "slight left": "Keep slightly left",
    "slight right": "Keep slightly right",
    "sharp left": "Turn sharply left",
    "sharp right": "Turn sharply right",
    uturn: "Make a U-turn",
  };

  const direction = directionMap[modifier] || "Continue";

  return roadName ? `${direction} onto ${roadName}` : direction;
}

function RouteInstructions({ route }) {
  if (!route?.legs?.length) {
    return null;
  }

  const steps = route.legs.flatMap((leg) => leg.steps || []);

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="route-instructions-section">
      <div className="section-header">
        <div>
          <div className="section-eyebrow">
            <ArrowUpRight size={13} />
            ROUTE INSTRUCTIONS
          </div>

          <h2>Driving directions</h2>

          <p>
            Turn-by-turn instructions generated from the calculated route.
          </p>
        </div>
      </div>

      <div className="instructions-card">
        <div className="instruction-list">
          {steps.map((step, index) => {
            const type = step?.maneuver?.type;

            const isStart = type === "depart";
            const isEnd = type === "arrive";

            return (
              <div
                className="instruction-item"
                key={`${index}-${step.name || "step"}`}
              >
                <div className="instruction-index">
                  {isStart ? (
                    <MapPin size={15} />
                  ) : isEnd ? (
                    <Flag size={15} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </div>

                <div className="instruction-content">
                  <strong>{formatInstruction(step)}</strong>

                  <div className="instruction-meta">
                    {step.distance > 0 && (
                      <span>{formatDistance(step.distance)}</span>
                    )}

                    {step.name && !isStart && !isEnd && (
                      <span>{step.name}</span>
                    )}
                  </div>
                </div>

                <div className="instruction-arrow">
                  {isStart ? (
                    <MapPin size={16} />
                  ) : isEnd ? (
                    <Flag size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="instructions-footer">
          <Package size={14} />
          <span>
            Pickup, fuel, rest, and dropoff activities are shown separately in
            the driver schedule.
          </span>
        </div>
      </div>
    </section>
  );
}

export default RouteInstructions;