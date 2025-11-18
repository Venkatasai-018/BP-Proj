import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { busApi } from '../services/api';
import { Route, RouteStop } from '../types';

const RoutesScreen: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoutes = async () => {
    try {
      const response = await busApi.getRoutes();
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to fetch routes. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderRouteItem = ({ item }: { item: Route }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeName}>{item.name}</Text>
        <View style={styles.durationBadge}>
          <MaterialIcons name="schedule" size={14} color="#007AFF" />
          <Text style={styles.durationText}>{formatDuration(item.estimated_duration)}</Text>
        </View>
      </View>
      
      <View style={styles.routePoints}>
        <View style={styles.pointContainer}>
          <MaterialIcons name="radio-button-checked" size={16} color="#4CAF50" />
          <Text style={styles.pointText}>{item.start_point}</Text>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.pointContainer}>
          <MaterialIcons name="location-on" size={16} color="#F44336" />
          <Text style={styles.pointText}>{item.end_point}</Text>
        </View>
      </View>
      
      {item.stops && item.stops.length > 0 && (
        <View style={styles.stopsSection}>
          <Text style={styles.stopsTitle}>Stops ({item.stops.length})</Text>
          <View style={styles.stopsContainer}>
            {item.stops.slice(0, 3).map((stop: RouteStop, index: number) => (
              <View key={stop.id} style={styles.stopChip}>
                <Text style={styles.stopChipText}>{stop.stop_name}</Text>
              </View>
            ))}
            {item.stops.length > 3 && (
              <View style={styles.stopChip}>
                <Text style={styles.stopChipText}>+{item.stops.length - 3} more</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading routes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRouteItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  listContainer: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routePoints: {
    marginBottom: 16,
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 7,
    marginVertical: -4,
  },
  stopsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  stopsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stopChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  stopChipText: {
    fontSize: 12,
    color: '#666',
  },
});

export default RoutesScreen;