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
import { studentService } from '../../services/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [busTracking, setBusTracking] = useState<any>(null);

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
      const data = await studentService.getDashboard();
      setDashboardData(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const trackBus = async () => {
    try {
      const data = await studentService.trackBus();
      setBusTracking(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to track bus');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  useEffect(() => {
    loadUserData();
    loadDashboard();
    trackBus();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10b981', '#059669', '#047857']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.userName}>{userData?.name || 'Student'}</Text>
            {userData?.roll_number && (
              <Text style={styles.userSubtitle}>{userData.roll_number}</Text>
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
            <Text style={styles.statValue}>{busTracking?.bus_number || 'N/A'}</Text>
            <Text style={styles.statLabel}>My Bus</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ddd6fe' }]}>
              <MaterialCommunityIcons name="map-marker-path" size={28} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>{busTracking?.route_name || 'N/A'}</Text>
            <Text style={styles.statLabel}>Route</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="clock-outline" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{busTracking?.eta || '15 min'}</Text>
            <Text style={styles.statLabel}>ETA</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
              <MaterialCommunityIcons name="check-circle" size={28} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{busTracking?.status || 'Active'}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Bus Tracking Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bus-marker" size={28} color="#10b981" />
            <Text style={styles.cardTitle}>Track Your Bus</Text>
          </View>
          {busTracking ? (
            <View style={styles.trackingInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bus Number:</Text>
                <Text style={styles.infoValue}>{busTracking.bus_number || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Route:</Text>
                <Text style={styles.infoValue}>{busTracking.route_name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, styles.statusActive]}>
                  {busTracking.status || 'Active'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ETA:</Text>
                <Text style={styles.infoValue}>{busTracking.eta || '15 mins'}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noData}>No bus assigned</Text>
          )}
          <TouchableOpacity style={styles.trackButton} onPress={trackBus}>
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="route" size={32} color="#10b981" />
              <Text style={styles.actionText}>My Route</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="calendar-clock" size={32} color="#3b82f6" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="bell" size={32} color="#f59e0b" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/student/feedback')}
            >
              <MaterialCommunityIcons name="message-text" size={32} color="#ef4444" />
              <Text style={styles.actionText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student Info */}
        {userData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{userData.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Roll Number:</Text>
              <Text style={styles.infoValue}>{userData.roll_number || 'N/A'}</Text>
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
    color: '#d1fae5',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
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
  trackingInfo: {
    marginVertical: 12,
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
  noData: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
