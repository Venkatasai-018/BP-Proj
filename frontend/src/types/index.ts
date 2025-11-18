export interface Bus {
  id: number;
  bus_number: string;
  driver_name: string;
  capacity: number;
  route_id?: number;
  is_active: boolean;
  current_location?: BusLocation;
}

export interface Route {
  id: number;
  name: string;
  start_point: string;
  end_point: string;
  estimated_duration: number;
  stops?: RouteStop[];
}

export interface RouteStop {
  id: number;
  route_id: number;
  stop_name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
  estimated_arrival_time: string;
}

export interface BusLocation {
  id: number;
  bus_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
}

export interface BusTrackingResponse {
  bus: Bus;
  route?: Route;
  current_location?: BusLocation;
  next_stop?: RouteStop;
}

export interface DashboardData {
  active_buses: number;
  total_routes: number;
  total_stops: number;
}

export interface RecentUpdate {
  bus_number: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
}