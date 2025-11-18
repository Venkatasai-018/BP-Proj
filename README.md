# College Bus Tracking System

A comprehensive bus tracking system designed for colleges with a FastAPI backend and React Native frontend. The system allows real-time tracking of college buses, route management, and provides a dashboard for monitoring bus operations.

## Features

### Backend (FastAPI)
- **Bus Management**: Create, read, update, and delete bus information
- **Route Management**: Manage bus routes with multiple stops
- **Real-time Location Tracking**: Track bus locations with timestamps
- **Dashboard API**: Get statistics and recent updates
- **SQLite Database**: Lightweight database for data storage

### Frontend (React Native)
- **Dashboard**: Overview of active buses, routes, and recent updates
- **Bus List**: View all buses with their current status
- **Real-time Tracking**: Track individual buses on a map
- **Route Information**: View route details with stops
- **Cross-platform**: Works on both iOS and Android

## Project Structure

```
BP-Proj/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database models and setup
│   ├── models.py           # Pydantic models
│   ├── seed_data.py        # Sample data generator
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── App.js              # Main React Native component
│   ├── package.json        # Node.js dependencies
│   ├── app.json           # Expo configuration
│   └── src/
│       ├── navigation/
│       │   └── AppNavigator.tsx
│       ├── screens/
│       │   ├── DashboardScreen.tsx
│       │   ├── BusListScreen.tsx
│       │   ├── BusTrackingScreen.tsx
│       │   └── RoutesScreen.tsx
│       ├── services/
│       │   └── api.ts
│       └── types/
│           └── index.ts
└── README.md
```

## Quick Start

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create sample data**:
   ```bash
   python seed_data.py
   ```

5. **Start the FastAPI server**:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Update API URL** (if needed):
   Edit `src/services/api.ts` and update the `BASE_URL` to match your backend server:
   ```typescript
   const BASE_URL = 'http://localhost:8000';
   ```

4. **Start the React Native development server**:
   ```bash
   npm start
   ```

### Docker Deployment (Recommended)

For a complete single-container deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Access the application
# Frontend: http://localhost
# API Docs: http://localhost/docs
# Direct API: http://localhost:8000
```

### EC2 Deployment

For AWS EC2 deployment, see [EC2-DEPLOYMENT.md](EC2-DEPLOYMENT.md) for detailed instructions.

Quick EC2 setup:
```bash
# On your EC2 instance
chmod +x deploy-ec2.sh
./deploy-ec2.sh

# Then build and start
docker-compose -f docker-compose.prod.yml up -d --build
```

## API Endpoints

### Bus Management
- `GET /buses` - Get all buses
- `GET /buses/{bus_id}` - Get specific bus with tracking info
- `POST /buses` - Create new bus
- `PUT /buses/{bus_id}` - Update bus information
- `DELETE /buses/{bus_id}` - Delete bus

### Route Management
- `GET /routes` - Get all routes with stops
- `GET /routes/{route_id}` - Get specific route
- `POST /routes` - Create new route
- `POST /routes/{route_id}/stops` - Add stop to route

### Location Tracking
- `POST /buses/{bus_id}/location` - Update bus location
- `GET /buses/{bus_id}/location` - Get current bus location
- `GET /buses/{bus_id}/location/history` - Get location history

### Dashboard
- `GET /dashboard/active-buses` - Get active buses count
- `GET /dashboard/routes-summary` - Get routes summary
- `GET /dashboard/recent-updates` - Get recent location updates

## Database Schema

### Tables

1. **buses**
   - id (Primary Key)
   - bus_number (Unique)
   - driver_name
   - capacity
   - route_id (Foreign Key)
   - is_active

2. **routes**
   - id (Primary Key)
   - name
   - start_point
   - end_point
   - estimated_duration

3. **route_stops**
   - id (Primary Key)
   - route_id (Foreign Key)
   - stop_name
   - latitude
   - longitude
   - stop_order
   - estimated_arrival_time

4. **bus_locations**
   - id (Primary Key)
   - bus_id (Foreign Key)
   - latitude
   - longitude
   - timestamp
   - speed

## Mobile App Screens

1. **Dashboard**: Shows statistics and recent updates
2. **Bus List**: Lists all buses with their status
3. **Bus Tracking**: Real-time map view of a specific bus
4. **Routes**: Shows all available routes with stops

## Configuration

### Backend Configuration
- Database: SQLite (default) - can be changed in `database.py`
- CORS: Configured for all origins (update for production)
- Port: 8000 (can be changed in `main.py`)

### Frontend Configuration
- Expo configuration in `app.json`
- API base URL in `src/services/api.ts`
- Navigation structure in `src/navigation/AppNavigator.tsx`

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py`, update models if needed
2. **Frontend**: Create new screens, update navigation, add API calls

### Sample Data
The `seed_data.py` file creates sample buses, routes, and locations for testing.

### Real-time Updates
The frontend automatically refreshes data:
- Dashboard: Every 60 seconds
- Bus tracking: Every 30 seconds
- Pull-to-refresh on all screens

## Production Deployment

### Backend
1. Use a production WSGI server like Gunicorn
2. Switch to a production database (PostgreSQL, MySQL)
3. Configure proper CORS origins
4. Add authentication and authorization
5. Set up proper logging

### Frontend
1. Build the app using Expo build service
2. Update API URLs for production
3. Add proper error handling
4. Configure app signing and publishing

## Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Check if backend server is running
   - Verify API URL in frontend configuration
   - Check network connectivity

2. **Database Errors**:
   - Ensure SQLite file permissions
   - Check if tables are created properly
   - Run seed_data.py to create sample data

3. **Map Not Loading**:
   - Check if location permissions are granted
   - Verify React Native Maps setup
   - Ensure valid coordinates in sample data

### Development Tips

1. Use Expo DevTools for debugging
2. Check FastAPI docs at `http://localhost:8000/docs`
3. Use React Native Debugger for frontend debugging
4. Check console logs for API errors

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please check the troubleshooting section or create an issue in the project repository.