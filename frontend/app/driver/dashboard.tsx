import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { driverService } from '../../services/api';

export default function DriverDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [locationSharing, setLocationSharing] = useState(false);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await driverService.getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationSharing = async () => {
    try {
      // Simulated location update
      await driverService.updateLocation(13.0827, 80.2707);
      setLocationSharing(!locationSharing);
      Alert.alert('Success', locationSharing ? 'Location sharing stopped' : 'Location sharing started');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update location');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  useEffect(() => {
    loadUserData();
    loadDashboard();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f59e0b', '#d97706', '#b45309']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Driver!</Text>
            <Text style={styles.userName}>{userData?.name || 'Driver'}</Text>
            {userData?.license_number && (
              <Text style={styles.userSubtitle}>License: {userData.license_number}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <MaterialCommunityIcons name="bus" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{dashboardData?.bus_number || 'N/A'}</Text>
            <Text style={styles.statLabel}>My Bus</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ddd6fe' }]}>
              <MaterialCommunityIcons name="routes" size={28} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>{dashboardData?.route_name || 'N/A'}</Text>
            <Text style={styles.statLabel}>Route</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="account-group" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{dashboardData?.capacity || '0'}</Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <MaterialCommunityIcons name="check-circle" size={28} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{locationSharing ? 'ON' : 'OFF'}</Text>
            <Text style={styles.statLabel}>Tracking</Text>
          </View>
        </View>

        {/* Location Sharing */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker-radius" size={28} color="#f59e0b" />
            <Text style={styles.cardTitle}>Location Sharing</Text>
          </View>
          <View style={styles.locationStatus}>
            <MaterialCommunityIcons
              name={locationSharing ? 'broadcast' : 'broadcast-off'}
              size={48}
              color={locationSharing ? '#10b981' : '#94a3b8'}
            />
            <Text style={styles.locationStatusText}>
              {locationSharing ? 'Sharing Location' : 'Location Sharing Off'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, locationSharing && styles.toggleButtonActive]}
            onPress={toggleLocationSharing}
          >
            <MaterialCommunityIcons
              name={locationSharing ? 'stop' : 'play'}
              size={20}
              color="#fff"
            />
            <Text style={styles.toggleButtonText}>
              {locationSharing ? 'Stop Sharing' : 'Start Sharing'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bus Information */}
        {dashboardData && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="bus" size={28} color="#f59e0b" />
              <Text style={styles.cardTitle}>My Bus</Text>
            </View>
            <View style={styles.busInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bus Number:</Text>
                <Text style={styles.infoValue}>{dashboardData.bus_number || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Route:</Text>
                <Text style={styles.infoValue}>{dashboardData.route_name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Capacity:</Text>
                <Text style={styles.infoValue}>{dashboardData.capacity || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, styles.statusActive]}>
                  {dashboardData.bus_status || 'Active'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="routes" size={32} color="#f59e0b" />
              <Text style={styles.actionText}>My Route</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="account-group" size={32} color="#3b82f6" />
              <Text style={styles.actionText}>Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="calendar" size={32} color="#10b981" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/driver/feedback')}
            >
              <MaterialCommunityIcons name="message-text" size={32} color="#ef4444" />
              <Text style={styles.actionText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driver Info */}
        {userData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{userData.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License:</Text>
              <Text style={styles.infoValue}>{userData.license_number || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{userData.phone || 'N/A'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fef3c7',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#fef3c7',
    marginTop: 4,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 12,
  },
  locationStatus: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  locationStatusText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    backgroundColor: '#94a3b8',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#10b981',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  busInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusActive: {
    color: '#10b981',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 8,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
