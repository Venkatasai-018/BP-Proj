import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  adminLogin: async (username: string, password: string) => {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
  },
  
  studentLogin: async (email: string, password: string) => {
    const response = await api.post('/students/login', { email, password });
    return response.data;
  },
  
  driverLogin: async (email: string, password: string) => {
    const response = await api.post('/drivers/login', { email, password });
    return response.data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  // Student Management
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },
  
  createStudent: async (data: any) => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },
  
  updateStudent: async (id: number, data: any) => {
    const response = await api.put(`/admin/students/${id}`, data);
    return response.data;
  },
  
  deleteStudent: async (id: number) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },
  
  // Driver Management
  getDrivers: async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
  },
  
  createDriver: async (data: any) => {
    const response = await api.post('/admin/drivers', data);
    return response.data;
  },
  
  updateDriver: async (id: number, data: any) => {
    const response = await api.put(`/admin/drivers/${id}`, data);
    return response.data;
  },
  
  deleteDriver: async (id: number) => {
    const response = await api.delete(`/admin/drivers/${id}`);
    return response.data;
  },
};

export const busService = {
  getBuses: async () => {
    const response = await api.get('/buses');
    return response.data;
  },
  
  getBus: async (id: number) => {
    const response = await api.get(`/buses/${id}`);
    return response.data;
  },
  
  createBus: async (data: any) => {
    const response = await api.post('/buses', data);
    return response.data;
  },
  
  updateBus: async (id: number, data: any) => {
    const response = await api.put(`/buses/${id}`, data);
    return response.data;
  },
  
  deleteBus: async (id: number) => {
    const response = await api.delete(`/buses/${id}`);
    return response.data;
  },
};

export const routeService = {
  getRoutes: async () => {
    const response = await api.get('/routes');
    return response.data;
  },
  
  getRoute: async (id: number) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },
  
  createRoute: async (data: any) => {
    const response = await api.post('/routes', data);
    return response.data;
  },
  
  deleteRoute: async (id: number) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  },
};

export const scheduleService = {
  getSchedules: async () => {
    const response = await api.get('/schedules');
    return response.data;
  },
  
  getSchedule: async (id: number) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  
  createSchedule: async (data: any) => {
    const response = await api.post('/schedules', data);
    return response.data;
  },
  
  deleteSchedule: async (id: number) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },
  
  trackBus: async () => {
    const response = await api.get('/students/track-bus');
    return response.data;
  },
};

export const driverService = {
  getDashboard: async () => {
    const response = await api.get('/drivers/dashboard');
    return response.data;
  },
  
  updateLocation: async (latitude: number, longitude: number) => {
    const response = await api.post('/drivers/location', { latitude, longitude });
    return response.data;
  },
};

export const feedbackService = {
  getFeedback: async () => {
    const response = await api.get('/feedback');
    return response.data;
  },
  
  getFeedbackSummary: async () => {
    const response = await api.get('/feedback/summary');
    return response.data;
  },
  
  submitFeedback: async (data: any) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
};

export default api;
