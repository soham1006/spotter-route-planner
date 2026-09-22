import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .routing import calculate_route
from .hos_engine import plan_hos

from .eld import build_daily_logs


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "Spotter Route Planner API is running"
    })


@api_view(["POST"])
def plan_trip(request):
    current_location = request.data.get("current_location")
    pickup_location = request.data.get("pickup_location")
    dropoff_location = request.data.get("dropoff_location")
    cycle_used = request.data.get("cycle_used")

    if not current_location or not pickup_location or not dropoff_location:
        return Response(
            {"error": "All locations are required."},
            status=400,
        )

    if cycle_used is None:
        return Response(
            {"error": "Current cycle used is required."},
            status=400,
        )

    try:
        cycle_used = float(cycle_used)
    except (TypeError, ValueError):
        return Response(
            {"error": "Current cycle used must be a number."},
            status=400,
        )

    if cycle_used < 0 or cycle_used > 70:
        return Response(
            {"error": "Current cycle used must be between 0 and 70 hours."},
            status=400,
        )

    try:
        route = calculate_route([
            current_location,
            pickup_location,
            dropoff_location,
        ])

        hos = plan_hos(route, cycle_used)
        daily_logs = build_daily_logs(hos["events"])

    except requests.RequestException:
        return Response(
            {"error": "Unable to reach the mapping service."},
            status=502,
        )

    except ValueError as error:
        return Response(
            {"error": str(error)},
            status=400,
        )

    return Response({
        "message": "Route calculated successfully",
        "trip": {
            "current_location": current_location,
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "cycle_used": cycle_used,
        },
        "route": route,
        "hos": hos,
        "daily_logs": daily_logs,
    })