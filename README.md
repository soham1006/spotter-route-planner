# Spotter Route Planner

A full-stack route planning and driver scheduling application built as part of the **Spotter AI Full Stack Developer Assessment**.

The application takes a driver's current location, pickup location, dropoff location, and current cycle usage, then generates a route plan with HOS-aware scheduling, fuel/rest stops, driving instructions, and daily ELD logs.

## Live Demo

**Live Application:**  
https://spotter-route-planner-six.vercel.app/

**Backend API:**  
https://spotter-route-planner-api-dz6z.onrender.com/

**Loom Demo:**  
YOUR_LOOM_LINK

---

## Features

### Route Planning

- Current location, pickup location, and dropoff location input
- Location geocoding
- Driving route calculation
- Interactive map visualization
- Route distance and estimated duration
- Turn-by-turn driving instructions

### HOS-Aware Scheduling

The backend generates a driver schedule based on the available cycle hours and the assessment requirements.

It handles:

- Driving periods
- 11-hour driving limit
- 14-hour driving window
- 30-minute rest break
- 70-hour / 8-day cycle
- 34-hour restart
- Pickup and dropoff activities
- Fuel stops
- Rest periods

### Driver Schedule

The generated schedule displays operational events such as:

- Driving
- Pickup
- Dropoff
- Fuel
- Rest
- Break
- Restart

### ELD / Driver Daily Logs

The application automatically generates daily driver logs from the HOS events.

The ELD interface includes:

- 24-hour duty-status graph
- Driving periods
- On-duty periods
- Off-duty periods
- Daily activity breakdown
- Multiple daily logs for longer trips

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Leaflet
- Leaflet
- Lucide React

### Backend

- Python
- Django
- Django REST Framework
- Requests

### Mapping & Geocoding

- Open-Meteo Geocoding API
- OSRM Routing API
- OpenStreetMap-based map visualization

### Deployment

- Frontend: Vercel
- Backend: Render

---

## Architecture

```text
                    ┌──────────────────────┐
                    │      React / Vite    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ POST /api/trips/plan/
                               ▼
                    ┌──────────────────────┐
                    │ Django REST API      │
                    │                      │
                    │ Trip Planning        │
                    │ HOS Engine           │
                    │ ELD Generator        │
                    └───────┬───────┬──────┘
                            │       │
                  ┌─────────┘       └─────────┐
                  ▼                           ▼
        ┌──────────────────┐        ┌──────────────────┐
        │ Open-Meteo       │        │ OSRM             │
        │ Geocoding API    │        │ Routing API      │
        └──────────────────┘        └──────────────────┘
```

---

## Project Structure

```text
spotter-route-planner/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── trips/
│   │   ├── eld.py
│   │   ├── hos_engine.py
│   │   ├── routing.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DriverSchedule.jsx
│   │   │   ├── ELDLog.jsx
│   │   │   ├── HOSSummary.jsx
│   │   │   ├── RouteInstructions.jsx
│   │   │   └── RouteMap.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## API

### Health Check

```http
GET /api/health/
```

Example response:

```json
{
  "status": "ok",
  "message": "Spotter Route Planner API is running"
}
```

### Plan Trip

```http
POST /api/trips/plan/
```

Example request:

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Columbus, OH",
  "dropoff_location": "Indianapolis, IN",
  "cycle_used": 20
}
```

The API returns:

- Trip information
- Route coordinates
- Route geometry
- Distance
- Duration
- Route legs
- HOS events
- Driving hours
- Cycle usage
- Daily ELD logs

---

## HOS Planning

The HOS engine is implemented in:

`backend/trips/hos_engine.py`

The scheduler considers the assessment requirements, including:

- Maximum 11 hours of driving
- 14-hour driving window
- 30-minute break
- 70-hour / 8-day cycle
- 34-hour restart
- 1-hour pickup
- 1-hour dropoff
- Fuel stops
- Rest periods

The generated HOS events are then used to create the daily driver logs.

---

## ELD Generation

ELD generation is implemented in:

`backend/trips/eld.py`

The ELD system takes the generated HOS events and splits them into 24-hour daily logs.

For trips extending beyond one day, additional daily logs are generated automatically.

---

## Testing

The backend includes automated tests covering:

- Short trips
- 30-minute break requirements
- Rest periods
- Fuel stops
- Cycle limits
- Pickup and dropoff durations

Run:

```bash
cd backend
python manage.py test trips
```

Expected result:

```text
Ran 6 tests

OK
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

Backend:

`http://127.0.0.1:8000/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173/`

For local development, configure:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Production Deployment

### Frontend

Deployed on Vercel:

https://spotter-route-planner-six.vercel.app/

### Backend

Deployed on Render:

https://spotter-route-planner-api-dz6z.onrender.com/

Backend start command:

```bash
gunicorn config.wsgi:application
```

---

## Assessment Deliverables

**Live Application:**  
https://spotter-route-planner-six.vercel.app/

**GitHub Repository:**  
https://github.com/soham1006/spotter-route-planner

**Loom Demo:**  
https://www.loom.com/share/9e301082703f481c8e91f59582a6a25d
---

## Author

**Soham Mewada**

Built for the **Spotter AI Full Stack Developer Assessment**.