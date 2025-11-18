import axios from 'axios';

// Configure base URL - update this to your FastAPI server URL
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const busApi = {
  // Bus endpoints
  getBuses: () => api.get('/buses'),
  getBus: (busId: number) => api.get(`/buses/${busId}`),
  createBus: (busData: any) => api.post('/buses', busData),
  updateBus: (busId: number, busData: any) => api.put(`/buses/${busId}`, busData),
  deleteBus: (busId: number) => api.delete(`/buses/${busId}`),

  // Route endpoints
  getRoutes: () => api.get('/routes'),
  getRoute: (routeId: number) => api.get(`/routes/${routeId}`),
  createRoute: (routeData: any) => api.post('/routes', routeData),
  addRouteStop: (routeId: number, stopData: any) => api.post(`/routes/${routeId}/stops`, stopData),

  // Location endpoints
  updateBusLocation: (busId: number, locationData: any) => 
    api.post(`/buses/${busId}/location`, locationData),
  getBusLocation: (busId: number) => api.get(`/buses/${busId}/location`),
  getBusLocationHistory: (busId: number, hours: number = 24) => 
    api.get(`/buses/${busId}/location/history?hours=${hours}`),

  // Dashboard endpoints
  getActiveBusesCount: () => api.get('/dashboard/active-buses'),
  getRoutesSummary: () => api.get('/dashboard/routes-summary'),
  getRecentUpdates: (limit: number = 10) => 
    api.get(`/dashboard/recent-updates?limit=${limit}`),
};

export default api;