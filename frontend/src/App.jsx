import {
  Truck,
  Route,
  MapPin,
  Package,
  Flag,
  Activity,
  ShieldCheck,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import RouteInstructions from "./components/RouteInstructions";

import { planTrip } from "./services/api";
import RouteMap from "./components/RouteMap";
import DriverSchedule from "./components/DriverSchedule";
import ELDLog from "./components/ELDLog";
import HOSSummary from "./components/HOSSummary";

function App() {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_used: "",
  });

  const [tripResult, setTripResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.current_location.trim()) {
      setError("Please enter the current location.");
      return;
    }

    if (!form.pickup_location.trim()) {
      setError("Please enter the pickup location.");
      return;
    }

    if (!form.dropoff_location.trim()) {
      setError("Please enter the dropoff location.");
      return;
    }

    if (form.cycle_used === "") {
      setError("Please enter the current cycle used.");
      return;
    }

    const cycleUsed = Number(form.cycle_used);

    if (Number.isNaN(cycleUsed)) {
      setError("Current cycle used must be a number.");
      return;
    }

    if (cycleUsed < 0 || cycleUsed > 70) {
      setError("Current cycle used must be between 0 and 70 hours.");
      return;
    }

    setIsPlanning(true);

    try {
      const response = await planTrip({
        ...form,
        cycle_used: cycleUsed,
      });

      console.log("Trip plan response:", response);

      setTripResult(response);
    } catch (error) {
      console.error(
        "Trip planning failed:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.error ||
          "Unable to plan the trip. Please check the locations and try again."
      );

      setTripResult(null);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <Truck size={19} strokeWidth={2.2} />
            </div>

            <div className="brand-copy">
              <div className="brand-title">SPOTTER</div>
              <div className="brand-product">Route Planner</div>
            </div>
          </div>

          <div className="header-divider" />

          <div className="header-context">
            <Route size={15} />
            <span>Trip Operations</span>
          </div>

          <div className="header-status">
            <span className="status-indicator" />
            <span>Routing engine online</span>
          </div>
        </div>
      </header>

      <main className="main">
        {/* PAGE INTRO */}
        <section className="page-intro">
          <div>
            <div className="eyebrow">
              <Activity size={13} />
              ROUTE OPERATIONS
            </div>

            <h1>Plan a compliant trip</h1>

            <p>
              Build a route, schedule HOS-compliant driving time, and generate
              driver logs from one trip plan.
            </p>
          </div>

          <div className="compliance-badge">
            <ShieldCheck size={16} />
            <div>
              <strong>HOS aware</strong>
              <span>70 hr / 8 day cycle</span>
            </div>
          </div>
        </section>

        {/* TRIP FORM */}
        <section className="planning-card">
          <div className="card-header">
            <div className="card-header-icon">
              <Route size={19} strokeWidth={2} />
            </div>

            <div className="card-header-content">
              <div className="card-title-row">
                <h2>Trip configuration</h2>
                <span className="required-badge">REQUIRED</span>
              </div>

              <p>
                Enter the route and current driver cycle information to
                generate the trip plan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-label">
                <span>ROUTE</span>
                <div />
              </div>

              <div className="form-grid">
                {/* CURRENT LOCATION */}
                <div className="form-field full-width">
                  <label htmlFor="current_location">
                    Current location
                  </label>

                  <div className="input-wrapper">
                    <MapPin size={17} />

                    <input
                      id="current_location"
                      name="current_location"
                      type="text"
                      placeholder="e.g. Chicago, IL"
                      value={form.current_location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <span className="field-help">
                    Starting point for the driver
                  </span>
                </div>

                {/* PICKUP */}
                <div className="form-field">
                  <label htmlFor="pickup_location">
                    Pickup location
                  </label>

                  <div className="input-wrapper">
                    <Package size={17} />

                    <input
                      id="pickup_location"
                      name="pickup_location"
                      type="text"
                      placeholder="e.g. Indianapolis, IN"
                      value={form.pickup_location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* DROPOFF */}
                <div className="form-field">
                  <label htmlFor="dropoff_location">
                    Dropoff location
                  </label>

                  <div className="input-wrapper">
                    <Flag size={17} />

                    <input
                      id="dropoff_location"
                      name="dropoff_location"
                      type="text"
                      placeholder="e.g. Columbus, OH"
                      value={form.dropoff_location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section cycle-section">
              <div className="form-section-label">
                <span>DRIVER HOURS</span>
                <div />
              </div>

              <div className="cycle-row">
                <div className="form-field cycle-field">
                  <label htmlFor="cycle_used">Current cycle used</label>

                  <div className="input-wrapper cycle-input">
                    <Clock3 size={17} />

                    <input
                      id="cycle_used"
                      name="cycle_used"
                      type="number"
                      min="0"
                      max="70"
                      step="0.5"
                      placeholder="20"
                      value={form.cycle_used}
                      onChange={handleChange}
                      required
                    />

                    <span className="input-unit">hours</span>
                  </div>

                  <div className="cycle-help">
                    <span>Maximum available cycle</span>
                    <strong>
                      {form.cycle_used !== ""
                        ? `${Math.max(
                            0,
                            70 - Number(form.cycle_used)
                          )} hrs remaining`
                        : "70 hrs"}
                    </strong>
                  </div>
                </div>

                <div className="cycle-info">
                  <ShieldCheck size={17} />

                  <div>
                    <strong>70-hour / 8-day cycle</strong>
                    <span>
                      Route scheduling accounts for the driver's available
                      cycle time.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM ACTION */}
            <div className="form-footer">
              {error && (
                <div className="form-error" role="alert">
                  <span className="error-mark">!</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPlanning}
                className="plan-trip-button"
              >
                {isPlanning ? (
                  <>
                    <span className="button-spinner" />
                    Generating plan
                  </>
                ) : (
                  <>
                    Generate trip plan
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* RESULTS */}
        <section className="route-section">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">
                <Route size={13} />
                ROUTE OVERVIEW
              </div>

              <h2>Trip route</h2>

              <p>
                {tripResult
                  ? "Calculated route and driver operating plan."
                  : "Your route, stops and driver schedule will appear here."}
              </p>
            </div>

            {tripResult && (
              <div className="result-status">
                <span />
                Plan generated
              </div>
            )}
          </div>

          {tripResult && (
            <div className="route-summary">
              <div className="summary-card">
                <span className="summary-label">TOTAL DISTANCE</span>
                <strong>{tripResult.route.distance_miles} mi</strong>
                <small>Route distance</small>
              </div>

              <div className="summary-card">
                <span className="summary-label">DRIVE TIME</span>
                <strong>{tripResult.route.duration_hours} hrs</strong>
                <small>Estimated driving time</small>
              </div>

              <div className="summary-card">
                <span className="summary-label">CYCLE USED</span>
                <strong>{form.cycle_used} / 70 hrs</strong>
                <small>
                  {Math.max(
                    0,
                    70 - Number(form.cycle_used || 0)
                  )}{" "}
                  hrs remaining
                </small>
              </div>
            </div>
          )}

          <RouteMap
            route={tripResult?.route}
            events={tripResult?.hos?.events}
          />

          <RouteInstructions route={tripResult?.route} />

          <HOSSummary hos={tripResult?.hos} />

          <DriverSchedule events={tripResult?.hos?.events} />

          <ELDLog dailyLogs={tripResult?.daily_logs} />
        </section>
      </main>
    </div>
  );
}

export default App;