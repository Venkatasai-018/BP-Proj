import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../../services/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const StatCard = ({ icon, title, value, color, gradientColors }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name={icon} size={28} color="#fff" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const MenuButton = ({ icon, title, color, gradientColors, onPress }: any) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuContent}>
        <LinearGradient
          colors={gradientColors}
          style={styles.menuIconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={icon} size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#dc2626', '#991b1b', '#7f1d1d']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back</Text>
            <Text style={styles.headerTitle}>Admin Control Panel</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.logoutButton}>
            <View style={styles.logoutButtonInner}>
              <MaterialCommunityIcons name="logout" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Statistics */}
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsContainer}>
          <StatCard
            icon="bus-multiple"
            title="Total Buses"
            value={stats?.total_buses || 0}
            color="#3b82f6"
            gradientColors={['#3b82f6', '#2563eb']}
          />
          <StatCard
            icon="map-marker-path"
            title="Routes"
            value={stats?.total_routes || 0}
            color="#8b5cf6"
            gradientColors={['#8b5cf6', '#7c3aed']}
          />
          <StatCard
            icon="account-group"
            title="Students"
            value={stats?.total_students || 0}
            color="#10b981"
            gradientColors={['#10b981', '#059669']}
          />
          <StatCard
            icon="account-tie"
            title="Drivers"
            value={stats?.total_drivers || 0}
            color="#f59e0b"
            gradientColors={['#f59e0b', '#d97706']}
          />
        </View>

        {/* Management Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <MenuButton
            icon="bus"
            title="Bus Management"
            color="#3b82f6"
            gradientColors={['#3b82f6', '#2563eb']}
            onPress={() => router.push('/admin/buses')}
          />
          <MenuButton
            icon="routes"
            title="Route Management"
            color="#8b5cf6"
            gradientColors={['#8b5cf6', '#7c3aed']}
            onPress={() => router.push('/admin/routes')}
          />
          <MenuButton
            icon="calendar-clock"
            title="Schedule Management"
            color="#06b6d4"
            gradientColors={['#06b6d4', '#0891b2']}
            onPress={() => router.push('/admin/schedules')}
          />
          <MenuButton
            icon="account-school"
            title="Student Management"
            color="#10b981"
            gradientColors={['#10b981', '#059669']}
            onPress={() => router.push('/admin/students')}
          />
          <MenuButton
            icon="steering"
            title="Driver Management"
            color="#f59e0b"
            gradientColors={['#f59e0b', '#d97706']}
            onPress={() => router.push('/admin/drivers')}
          />
          <MenuButton
            icon="message-star"
            title="Feedback Dashboard"
            gradientColors={['#ec4899', '#db2777']}
            color="#ec4899"
            onPress={() => router.push('/admin/feedback')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  logoutButton: {
    padding: 4,
  },
  logoutButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 24,
    letterSpacing: 0.3,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  statIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: 0.2,
  },
});
