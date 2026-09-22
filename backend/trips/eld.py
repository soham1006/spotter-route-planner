def build_daily_logs(events):
    if not events:
        return []

    max_hour = max(event["end_hour"] for event in events)

    number_of_days = max(1, int(max_hour // 24) + 1)

    daily_logs = []

    for day in range(number_of_days):
        day_start = day * 24
        day_end = day_start + 24

        day_events = []

        for event in events:
            event_start = event["start_hour"]
            event_end = event["end_hour"]

            if event_end <= day_start or event_start >= day_end:
                continue

            clipped_start = max(event_start, day_start)
            clipped_end = min(event_end, day_end)

            day_events.append({
                **event,
                "start_hour": round(clipped_start - day_start, 2),
                "end_hour": round(clipped_end - day_start, 2),
                "duration_hours": round(
                    clipped_end - clipped_start,
                    2,
                ),
            })

        daily_logs.append({
            "day": day + 1,
            "events": day_events,
        })

    return daily_logs