from asyncio import events


def get_route_point(route, distance_miles):
    geometry = route["geometry"]["coordinates"]

    total_distance = route["distance_miles"]

    if total_distance <= 0:
        return None

    ratio = min(distance_miles / total_distance, 1)

    index = int(ratio * (len(geometry) - 1))

    lon, lat = geometry[index]

    return {
        "lat": lat,
        "lon": lon,
    }

def add_event(events, event_type, start, duration, label, distance_miles=0):
    events.append({
        "type": event_type,
        "start_hour": round(start, 2),
        "end_hour": round(start + duration, 2),
        "duration_hours": round(duration, 2),
        "label": label,
        "distance_miles": round(distance_miles, 2),
    })


def plan_hos(route, cycle_used):
    events = []

    current_time = 0
    shift_time = 0
    driving_time = 0
    driving_since_break = 0
    cycle_hours = cycle_used

    total_distance = 0
    next_fuel_mile = 1000

    legs = route["legs"]

    def add_drive(duration, distance):
        nonlocal current_time
        nonlocal shift_time
        nonlocal driving_time
        nonlocal driving_since_break
        nonlocal cycle_hours
        nonlocal total_distance

        add_event(
        events,
        "driving",
        current_time,
        duration,
        "Driving",
        distance,
        )

        events[-1]["route_position"] = get_route_point(
        route,
        total_distance,
        )

        current_time += duration
        shift_time += duration
        driving_time += duration
        driving_since_break += duration
        cycle_hours += duration
        total_distance += distance

    def add_break():
        nonlocal current_time
        nonlocal shift_time
        nonlocal driving_since_break

        add_event(
            events,
            "break",
            current_time,
            0.5,
            "30-minute break",
        )

        events[-1]["route_position"] = get_route_point(
        route,
        total_distance,
        )

        current_time += 0.5
        shift_time += 0.5
        driving_since_break = 0

    def add_rest():
        nonlocal current_time
        nonlocal shift_time
        nonlocal driving_time
        nonlocal driving_since_break

        add_event(
            events,
            "rest",
            current_time,
            10,
            "10-hour off-duty rest",
        )

        events[-1]["route_position"] = get_route_point(
        route,
        total_distance,
        )

        current_time += 10
        shift_time = 0
        driving_time = 0
        driving_since_break = 0

    def add_restart():
        nonlocal current_time
        nonlocal shift_time
        nonlocal driving_time
        nonlocal driving_since_break
        nonlocal cycle_hours

        add_event(
            events,
            "restart",
            current_time,
            34,
            "34-hour cycle restart",
        )

        events[-1]["route_position"] = get_route_point(
        route,
        total_distance,
        )

        current_time += 34
        shift_time = 0
        driving_time = 0
        driving_since_break = 0
        cycle_hours = 0

    def add_on_duty(event_type, duration, label):
        nonlocal current_time
        nonlocal shift_time
        nonlocal cycle_hours
        nonlocal driving_since_break

        add_event(
            events,
            event_type,
            current_time,
            duration,
            label,
        )

        current_time += duration
        shift_time += duration
        cycle_hours += duration

        # Pickup, dropoff and fuel are non-driving periods.
        # A 30+ minute non-driving period satisfies the break clock.
        if duration >= 0.5:
            driving_since_break = 0

    for index, leg in enumerate(legs):
        remaining_distance = leg["distance"] / 1609.344
        remaining_hours = leg["duration"] / 3600

        while remaining_hours > 0.01:

            # 70-hour cycle limit
            if cycle_hours >= 70:
                add_restart()
                continue

            # 11-hour daily driving limit
            if driving_time >= 11:
                add_rest()
                continue

            # 14-hour window
            if shift_time >= 14:
                add_rest()
                continue

            # 30-minute break after 8 cumulative driving hours
            if driving_since_break >= 8:
                add_break()
                continue

            available_time = min(
                remaining_hours,
                11 - driving_time,
                14 - shift_time,
                8 - driving_since_break,
                70 - cycle_hours,
            )

            # Stop at the next 1,000-mile fuel point.
            miles_until_fuel = next_fuel_mile - total_distance

            if miles_until_fuel < remaining_distance:
                hours_until_fuel = (
                    miles_until_fuel / remaining_distance
                ) * remaining_hours

                available_time = min(
                    available_time,
                    hours_until_fuel,
                )

            if available_time <= 0:
                break

            distance_for_segment = (
                remaining_distance
                * (available_time / remaining_hours)
            )

            add_drive(
                available_time,
                distance_for_segment,
            )

            remaining_hours -= available_time
            remaining_distance -= distance_for_segment

            # Fuel stop
            if total_distance >= next_fuel_mile - 0.01:
                add_on_duty(
                    "fuel",
                    0.5,
                    f"Fuel stop at {next_fuel_mile:.0f} miles",
                )

                events[-1]["route_position"] = get_route_point(
                    route,
                    total_distance,
                )

                next_fuel_mile += 1000

        # Pickup after the first leg
        if index == 0:
            add_on_duty(
                "pickup",
                1,
                "Pickup - 1 hour",
            )

        # Dropoff after the final leg
        if index == len(legs) - 1:
            add_on_duty(
                "dropoff",
                1,
                "Dropoff - 1 hour",
            )

    return {
        "events": events,
        "total_hours": round(current_time, 2),
        "driving_hours": round(
            sum(
                event["duration_hours"]
                for event in events
                if event["type"] == "driving"
            ),
            2,
        ),
        "cycle_used_start": cycle_used,
        "cycle_used_end": round(cycle_hours, 2),
    }