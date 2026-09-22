import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

function StopMarkers({ events }) {
  if (!events || events.length === 0) {
    return null;
  }

  const stopStyles = {
    break: {
      color: "#f59e0b",
      label: "30-Minute Break",
    },
    rest: {
      color: "#64748b",
      label: "10-Hour Rest",
    },
    fuel: {
      color: "#16a34a",
      label: "Fuel Stop",
    },
    restart: {
      color: "#7c3aed",
      label: "34-Hour Restart",
    },
  };

  return events
    .filter(
      (event) =>
        event.route_position &&
        stopStyles[event.type]
    )
    .map((event, index) => {
      const style = stopStyles[event.type];

      return (
        <CircleMarker
          key={`hos-stop-${index}`}
          center={[
            event.route_position.lat,
            event.route_position.lon,
          ]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: style.color,
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>{style.label}</strong>
            <br />
            {event.label}
            <br />
            Duration: {event.duration_hours} hrs
          </Popup>
        </CircleMarker>
      );
    });
}

function FitRoute({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry || !geometry.coordinates) {
      return;
    }

    const bounds = geometry.coordinates.map(([lng, lat]) => [
      lat,
      lng,
    ]);

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [30, 30],
      });
    }
  }, [geometry, map]);

  return null;
}

function RouteMap({ route, events }) {
  if (!route) {
    return (
      <div className="map-placeholder">
        <p>Plan a trip to display the route.</p>
      </div>
    );
  }

  const locations = route.coordinates || [];

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      scrollWheelZoom={true}
      className="route-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route */}
      <GeoJSON
        data={route.geometry}
        style={{
          color: "#1d4ed8",
          weight: 5,
        }}
      />

      {/* Current Location, Pickup, Dropoff */}
      {locations.map((location, index) => (
        <Marker
          key={`location-${index}`}
          position={[
            location.lat,
            location.lon,
          ]}
        >
          <Popup>
            <strong>
              {index === 0
                ? "Current Location"
                : index === 1
                ? "Pickup"
                : "Dropoff"}
            </strong>

            <br />

            {location.display_name}
          </Popup>
        </Marker>
      ))}

      {/* HOS Stops */}
      <StopMarkers events={events} />

      {/* Automatically fit route */}
      <FitRoute geometry={route.geometry} />
    </MapContainer>
  );
}

export default RouteMap;