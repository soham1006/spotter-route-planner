import requests
import time

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

HEADERS = {
    "User-Agent": "SpotterRoutePlanner/1.0",
    "Referer": "https://spotter-route-planner-api-dz6z.onrender.com/",
}


def geocode_location(location):
    params = {
        "q": location,
        "format": "jsonv2",
        "limit": 1,
    }

    response = requests.get(
        NOMINATIM_URL,
        params=params,
        headers=HEADERS,
        timeout=10,
    )

    response.raise_for_status()

    results = response.json()

    if not results:
        raise ValueError(f"Location not found: {location}")

    result = results[0]

    return {
        "lat": float(result["lat"]),
        "lon": float(result["lon"]),
        "display_name": result["display_name"],
    }


def calculate_route(locations):
    coordinates = []

    for index, location in enumerate(locations):
        if index > 0:
            time.sleep(2)

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
        raise ValueError("No route could be found between the locations.")

    route = data["routes"][0]

    return {
        "coordinates": coordinates,
        "geometry": route["geometry"],
        "distance_miles": round(route["distance"] / 1609.344, 2),
        "duration_hours": round(route["duration"] / 3600, 2),
        "legs": route["legs"],
    }