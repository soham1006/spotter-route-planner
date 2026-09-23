import requests

OPEN_METEO_GEOCODING_URL = (
    "https://geocoding-api.open-meteo.com/v1/search"
)

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"


def geocode_location(location):
    params = {
        "name": location,
        "count": 1,
        "language": "en",
        "format": "json",
    }

    response = requests.get(
        OPEN_METEO_GEOCODING_URL,
        params=params,
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()
    results = data.get("results", [])

    if not results:
        raise ValueError(f"Location not found: {location}")

    result = results[0]

    return {
        "lat": float(result["latitude"]),
        "lon": float(result["longitude"]),
        "display_name": ", ".join(
            part
            for part in [
                result.get("name"),
                result.get("admin1"),
                result.get("country"),
            ]
            if part
        ),
    }


def calculate_route(locations):
    coordinates = []

    for location in locations:
        coordinates.append(geocode_location(location))

    coordinate_string = ";".join(
        f"{location['lon']},{location['lat']}"
        for location in coordinates
    )

    url = f"{OSRM_URL}/{coordinate_string}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true",
    }

    response = requests.get(
        url,
        params=params,
        timeout=20,
    )
    response.raise_for_status()

    data = response.json()

    if data.get("code") != "Ok":
        raise ValueError(
            "No route could be found between the locations."
        )

    route = data["routes"][0]

    return {
        "coordinates": coordinates,
        "geometry": route["geometry"],
        "distance_miles": round(
            route["distance"] / 1609.344,
            2,
        ),
        "duration_hours": round(
            route["duration"] / 3600,
            2,
        ),
        "legs": route["legs"],
    }