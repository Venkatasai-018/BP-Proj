# TCE EduRide Mobile App 🚌📱

Beautiful React Native Expo frontend for the TCE EduRide Bus Tracking System.

## ✨ Features

- **Beautiful Modern UI** - Clean, professional design with smooth animations
- **Role-Based Access** - Separate interfaces for Admin, Student, and Driver
- **Real-time Tracking** - Live bus location updates
- **Responsive Design** - Works on all screen sizes
- **Easy Navigation** - Intuitive user experience

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the App

```bash
npx expo start
```

### 3. Run on Device

- **Android**: Press `a` or scan QR code with Expo Go app
- **iOS**: Press `i` or scan QR code with Expo Go app  
- **Web**: Press `w`

## 📱 App Structure

```
frontend/
├── app/
│   ├── index.tsx          # Landing page with role selection
│   ├── _layout.tsx        # Root navigation layout
│   ├── admin/
│   │   ├── login.tsx      # Admin login screen
│   │   └── dashboard.tsx  # Admin dashboard
│   ├── student/           # Student screens
│   └── driver/            # Driver screens
├── components/            # Reusable UI components
├── services/
│   └── api.ts            # API integration
└── package.json

```

## 🎨 Screens

### 1. Landing Page
- Beautiful gradient design
- Three role cards: Admin, Student, Driver
- Smooth navigation

### 2. Admin Portal
- **Login** - Secure authentication
- **Dashboard** - Overview statistics
- **Management** - Buses, Routes, Schedules, Students, Drivers, Feedback

### 3. Student Portal
- Track assigned bus in real-time
- View schedule
- Submit feedback

### 4. Driver Portal
- Update current location
- View assigned route
- View schedule

## 🔌 API Configuration

Update API base URL in `services/api.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_IP:8000/api/v1';
```

For local testing:
- Android Emulator: `http://10.0.2.2:8000/api/v1`
- iOS Simulator: `http://127.0.0.1:8000/api/v1`
- Physical Device: `http://YOUR_COMPUTER_IP:8000/api/v1`

## 🎯 Default Credentials

**Admin:**
- Username: `admin` | Password: `admin123`
- Username: `tceeduride` | Password: `tce@2025`

**Student/Driver:** Created by admin

## 📦 Dependencies

- **expo**: ~52.0.0
- **expo-router**: File-based navigation
- **react-native**: 0.76.5
- **axios**: API calls
- **@expo/vector-icons**: Beautiful icons

## 🛠️ Development

### Add New Screen

1. Create file in `app/` directory
2. It automatically becomes a route

### Add New API Call

Update `services/api.ts`:

```typescript
export const myService = {
  getData: async () => {
    const response = await api.get('/endpoint');
    return response.data;
  },
};
```

## 🎨 Color Palette

- **Primary Blue**: #2563eb
- **Admin Red**: #ef4444
- **Student Green**: #10b981
- **Driver Orange**: #f59e0b
- **Purple**: #8b5cf6
- **Background**: #f8fafc

## 📱 Screenshots

Beautiful modern design with:
- Gradient backgrounds
- Card-based layouts
- Shadow effects
- Smooth transitions
- Icon-rich interface

## 🚀 Build for Production

```bash
# Android
eas build -p android

# iOS
eas build -p ios
```

## 📄 License

MIT License - TCE EduRide Project
