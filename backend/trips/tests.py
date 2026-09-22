from django.test import SimpleTestCase

from .hos_engine import plan_hos


def make_route(distance_miles, duration_hours):
    return {
        "distance_miles": distance_miles,
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-100, 40],
                [-90, 40],
            ],
        },
        "legs": [
            {
                "distance": distance_miles * 1609.344,
                "duration": duration_hours * 3600,
            }
        ],
    }


class HOSEngineTests(SimpleTestCase):

    def test_short_trip(self):
        route = make_route(300, 6)

        result = plan_hos(route, 10)

        event_types = [
            event["type"]
            for event in result["events"]
        ]

        self.assertIn("driving", event_types)
        self.assertIn("pickup", event_types)
        self.assertIn("dropoff", event_types)

    def test_30_minute_break(self):
        route = make_route(700, 14)

        result = plan_hos(route, 10)

        event_types = [
            event["type"]
            for event in result["events"]
        ]

        self.assertIn("break", event_types)

    def test_10_hour_rest(self):
        route = make_route(1200, 24)

        result = plan_hos(route, 10)

        event_types = [
            event["type"]
            for event in result["events"]
        ]

        self.assertIn("rest", event_types)

    def test_fuel_stop(self):
        route = make_route(1200, 24)

        result = plan_hos(route, 10)

        fuel_events = [
            event
            for event in result["events"]
            if event["type"] == "fuel"
        ]

        self.assertGreaterEqual(len(fuel_events), 1)

    def test_cycle_limit_restart(self):
        route = make_route(500, 10)

        result = plan_hos(route, 65)

        restart_events = [
            event
            for event in result["events"]
            if event["type"] == "restart"
        ]

        self.assertGreaterEqual(len(restart_events), 1)

    def test_pickup_and_dropoff_are_one_hour(self):
        route = make_route(200, 4)

        result = plan_hos(route, 5)

        pickup = next(
            event
            for event in result["events"]
            if event["type"] == "pickup"
        )

        dropoff = next(
            event
            for event in result["events"]
            if event["type"] == "dropoff"
        )

        self.assertEqual(pickup["duration_hours"], 1)
        self.assertEqual(dropoff["duration_hours"], 1)