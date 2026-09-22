import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api",
});

export const planTrip = async (tripData) => {
  const response = await api.post("/trips/plan/", tripData);
  return response.data;
};

export default api;