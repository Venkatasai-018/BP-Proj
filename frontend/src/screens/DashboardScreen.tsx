import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { busApi } from '../services/api';
import { DashboardData, RecentUpdate } from '../types';

const DashboardScreen: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [activeBusesResponse, routesSummaryResponse, recentUpdatesResponse] = await Promise.all([
        busApi.getActiveBusesCount(),
        busApi.getRoutesSummary(),
        busApi.getRecentUpdates(5),
      ]);

      setDashboardData({
        active_buses: activeBusesResponse.data.active_buses,
        total_routes: routesSummaryResponse.data.total_routes,
        total_stops: routesSummaryResponse.data.total_stops,
      });

      setRecentUpdates(recentUpdatesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = 
    ({ title, value, icon, color }) => (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
          <MaterialIcons name={icon as any} size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>College Bus Tracker</Text>
        <Text style={styles.headerSubtitle}>Real-time bus monitoring system</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Active Buses"
          value={dashboardData?.active_buses || 0}
          icon="directions-bus"
          color="#4CAF50"
        />
        
        <StatCard
          title="Total Routes"
          value={dashboardData?.total_routes || 0}
          icon="route"
          color="#2196F3"
        />
        
        <StatCard
          title="Bus Stops"
          value={dashboardData?.total_stops || 0}
          icon="location-on"
          color="#FF9800"
        />
      </View>

      {/* Recent Updates */}
      <View style={styles.recentUpdatesSection}>
        <Text style={styles.sectionTitle}>Recent Location Updates</Text>
        
        {recentUpdates.length > 0 ? (
          recentUpdates.map((update, index) => (
            <View key={index} style={styles.updateCard}>
              <View style={styles.updateHeader}>
                <View style={styles.busInfo}>
                  <MaterialIcons name="directions-bus" size={20} color="#007AFF" />
                  <Text style={styles.busNumber}>{update.bus_number}</Text>
                </View>
                <Text style={styles.updateTime}>
                  {new Date(update.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              
              <View style={styles.updateDetails}>
                <View style={styles.locationInfo}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.locationText}>
                    {update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}
                  </Text>
                </View>
                
                <View style={styles.speedInfo}>
                  <MaterialIcons name="speed" size={16} color="#666" />
                  <Text style={styles.speedText}>{update.speed.toFixed(1)} km/h</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="info" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No recent updates available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recentUpdatesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  updateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busNumber: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  updateTime: {
    fontSize: 12,
    color: '#666',
  },
  updateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  speedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
});

export default DashboardScreen;