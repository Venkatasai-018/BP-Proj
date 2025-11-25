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
  
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },
  
  createStudent: async (data: any) => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },
  
  getDrivers: async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
  },
  
  createDriver: async (data: any) => {
    const response = await api.post('/admin/drivers', data);
    return response.data;
  },
};

export const busService = {
  getBuses: async () => {
    const response = await api.get('/buses');
    return response.data;
  },
  
  createBus: async (data: any) => {
    const response = await api.post('/buses', data);
    return response.data;
  },
};

export const routeService = {
  getRoutes: async () => {
    const response = await api.get('/routes');
    return response.data;
  },
  
  createRoute: async (data: any) => {
    const response = await api.post('/routes', data);
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

export default api;
