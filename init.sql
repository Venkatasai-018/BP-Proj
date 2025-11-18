-- Database initialization script for Bus Tracking System
-- This script creates the necessary tables and initial data

-- Create enum types (if using PostgreSQL)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'staff', 'driver', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bus_status AS ENUM ('active', 'inactive', 'maintenance', 'delayed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (Enhanced for authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_point VARCHAR(100) NOT NULL,
    end_point VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_duration INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buses table (Enhanced)
CREATE TABLE IF NOT EXISTS buses (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_contact VARCHAR(20),
    capacity INTEGER NOT NULL,
    route_id INTEGER REFERENCES routes(id),
    status bus_status DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    stop_order INTEGER NOT NULL,
    estimated_arrival INTEGER, -- minutes from start
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus locations table
CREATE TABLE IF NOT EXISTS bus_locations (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    heading INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accuracy DECIMAL(8, 2),
    altitude DECIMAL(8, 2)
);

-- User permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL, -- 'track_bus', 'track_route', etc.
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buses_route_id ON buses(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus_id ON bus_locations(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_timestamp ON bus_locations(timestamp);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_bus_id ON user_permissions(bus_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_route_id ON user_permissions(route_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_timestamp ON user_activity_log(timestamp);

-- Insert sample data
INSERT INTO users (username, email, full_name, hashed_password, role) VALUES 
('admin', 'admin@college.edu', 'System Administrator', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'super_admin'),
('student1', 'student1@college.edu', 'John Doe', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student'),
('driver1', 'driver1@college.edu', 'Mike Johnson', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'driver')
ON CONFLICT (username) DO NOTHING;

INSERT INTO routes (name, start_point, end_point, description, estimated_duration) VALUES 
('Route A', 'Main Gate', 'Academic Block', 'Main campus route covering academic areas', 15),
('Route B', 'Hostel Area', 'Sports Complex', 'Route connecting hostels to sports facilities', 12),
('Route C', 'Library', 'Cafeteria', 'Study and dining areas connection', 8),
('Route D', 'Admin Block', 'Parking Lot', 'Administrative area to parking', 10)
ON CONFLICT DO NOTHING;

INSERT INTO buses (bus_number, driver_name, driver_contact, capacity, route_id) VALUES 
('BUS001', 'Mike Johnson', '+1234567890', 50, 1),
('BUS002', 'Sarah Wilson', '+1234567891', 45, 2),
('BUS003', 'Tom Brown', '+1234567892', 40, 3),
('BUS004', 'Lisa Davis', '+1234567893', 55, 4),
('BUS005', 'James Miller', '+1234567894', 48, 1)
ON CONFLICT (bus_number) DO NOTHING;

INSERT INTO route_stops (route_id, stop_name, latitude, longitude, stop_order, estimated_arrival) VALUES 
-- Route A stops
(1, 'Main Gate', 28.7041, 77.1025, 1, 0),
(1, 'Library Junction', 28.7045, 77.1030, 2, 3),
(1, 'Central Plaza', 28.7048, 77.1035, 3, 6),
(1, 'Academic Block', 28.7052, 77.1040, 4, 10),

-- Route B stops
(2, 'Hostel Area', 28.7040, 77.1020, 1, 0),
(2, 'Canteen Corner', 28.7042, 77.1025, 2, 4),
(2, 'Medical Center', 28.7044, 77.1028, 3, 7),
(2, 'Sports Complex', 28.7046, 77.1032, 4, 12)
ON CONFLICT DO NOTHING;

-- Grant sample permissions
INSERT INTO user_permissions (user_id, bus_id, permission_type, granted_by) VALUES 
(2, 1, 'track_bus', 1),
(2, 2, 'track_bus', 1),
(3, 1, 'track_bus', 1)
ON CONFLICT DO NOTHING;

-- Insert sample location data for testing
INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading) VALUES 
(1, 28.7041, 77.1025, 25.5, 90),
(2, 28.7040, 77.1020, 30.0, 180),
(3, 28.7048, 77.1035, 20.0, 270),
(4, 28.7052, 77.1040, 15.5, 0),
(5, 28.7045, 77.1030, 28.0, 45)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();