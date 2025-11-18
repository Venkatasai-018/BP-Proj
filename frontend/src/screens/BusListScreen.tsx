import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { busApi } from '../services/api';
import { Bus } from '../types';

interface BusListScreenProps {
  navigation: any;
}

const BusListScreen: React.FC<BusListScreenProps> = ({ navigation }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBuses = async () => {
    try {
      const response = await busApi.getBuses();
      setBuses(response.data);
    } catch (error) {
      console.error('Error fetching buses:', error);
      Alert.alert('Error', 'Failed to fetch buses. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBuses();
  };

  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity
      style={[styles.busCard, !item.is_active && styles.inactiveBus]}
      onPress={() => navigation.navigate('BusTracking', { busId: item.id })}
    >
      <View style={styles.busHeader}>
        <Text style={styles.busNumber}>{item.bus_number}</Text>
        <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.busDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>Driver: {item.driver_name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="people" size={16} color="#666" />
          <Text style={styles.detailText}>Capacity: {item.capacity}</Text>
        </View>
        
        {item.current_location && (
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>
              Last seen: {new Date(item.current_location.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.trackButton}>
        <MaterialIcons name="track-changes" size={20} color="#007AFF" />
        <Text style={styles.trackText}>Track Bus</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading buses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={buses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBusItem}
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
  busCard: {
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
  inactiveBus: {
    opacity: 0.7,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  busDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  trackText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default BusListScreen;