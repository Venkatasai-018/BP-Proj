import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { busApi } from '../services/api';
import { BusTrackingResponse, RouteStop } from '../types';

interface BusTrackingScreenProps {
  route: {
    params: {
      busId: number;
    };
  };
}

const BusTrackingScreen: React.FC<BusTrackingScreenProps> = ({ route }) => {
  const { busId } = route.params;
  const [trackingData, setTrackingData] = useState<BusTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBusData = async () => {
    try {
      const response = await busApi.getBus(busId);
      setTrackingData(response.data);
    } catch (error) {
      console.error('Error fetching bus data:', error);
      Alert.alert('Error', 'Failed to fetch bus tracking data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchBusData, 30000);
    return () => clearInterval(interval);
  }, [busId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusData();
  };

  const getMapRegion = () => {
    if (trackingData?.current_location) {
      return {
        latitude: trackingData.current_location.latitude,
        longitude: trackingData.current_location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    // Default region (Hyderabad area)
    return {
      latitude: 17.4435,
      longitude: 78.3772,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const renderRouteMarkers = () => {
    if (!trackingData?.route?.stops) return null;

    return trackingData.route.stops.map((stop: RouteStop, index: number) => (
      <Marker
        key={stop.id}
        coordinate={{
          latitude: stop.latitude,
          longitude: stop.longitude,
        }}
        title={stop.stop_name}
        description={`Stop ${stop.stop_order} - ETA: ${stop.estimated_arrival_time}`}
        pinColor={index === 0 ? 'green' : index === trackingData.route!.stops!.length - 1 ? 'red' : 'orange'}
      />
    ));
  };

  const renderRoutePolyline = () => {
    if (!trackingData?.route?.stops || trackingData.route.stops.length < 2) return null;

    const coordinates = trackingData.route.stops.map(stop => ({
      latitude: stop.latitude,
      longitude: stop.longitude,
    }));

    return (
      <Polyline
        coordinates={coordinates}
        strokeColor="#007AFF"
        strokeWidth={3}
        strokePattern={[5, 5]}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading bus tracking data...</Text>
      </View>
    );
  }

  if (!trackingData) {
    return (
      <View style={styles.centerContainer}>
        <Text>No tracking data available</Text>
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
      {/* Bus Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.busHeader}>
          <Text style={styles.busNumber}>{trackingData.bus.bus_number}</Text>
          <View style={[styles.statusBadge, trackingData.bus.is_active ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>
              {trackingData.bus.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color="#666" />
          <Text style={styles.infoText}>Driver: {trackingData.bus.driver_name}</Text>
        </View>
        
        {trackingData.route && (
          <View style={styles.infoRow}>
            <MaterialIcons name="route" size={20} color="#666" />
            <Text style={styles.infoText}>Route: {trackingData.route.name}</Text>
          </View>
        )}
        
        {trackingData.current_location && (
          <View style={styles.infoRow}>
            <MaterialIcons name="speed" size={20} color="#666" />
            <Text style={styles.infoText}>Speed: {trackingData.current_location.speed.toFixed(1)} km/h</Text>
          </View>
        )}
        
        {trackingData.current_location && (
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color="#666" />
            <Text style={styles.infoText}>
              Last Updated: {new Date(trackingData.current_location.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Current Bus Location */}
          {trackingData.current_location && (
            <Marker
              coordinate={{
                latitude: trackingData.current_location.latitude,
                longitude: trackingData.current_location.longitude,
              }}
              title={trackingData.bus.bus_number}
              description={`Driver: ${trackingData.bus.driver_name}`}
              pinColor="blue"
            >
              <View style={styles.busMarker}>
                <MaterialIcons name="directions-bus" size={24} color="white" />
              </View>
            </Marker>
          )}
          
          {/* Route Markers and Polyline */}
          {renderRouteMarkers()}
          {renderRoutePolyline()}
        </MapView>
      </View>

      {/* Next Stop Info */}
      {trackingData.next_stop && (
        <View style={styles.nextStopCard}>
          <Text style={styles.nextStopTitle}>Next Stop</Text>
          <Text style={styles.nextStopName}>{trackingData.next_stop.stop_name}</Text>
          <Text style={styles.nextStopEta}>ETA: {trackingData.next_stop.estimated_arrival_time}</Text>
        </View>
      )}
      
      {/* Route Stops List */}
      {trackingData.route?.stops && (
        <View style={styles.stopsCard}>
          <Text style={styles.stopsTitle}>Route Stops</Text>
          {trackingData.route.stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopNumber}>
                <Text style={styles.stopNumberText}>{stop.stop_order}</Text>
              </View>
              <View style={styles.stopDetails}>
                <Text style={styles.stopName}>{stop.stop_name}</Text>
                <Text style={styles.stopTime}>ETA: {stop.estimated_arrival_time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  map: {
    flex: 1,
  },
  busMarker: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  nextStopCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nextStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  nextStopName: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextStopEta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  stopsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stopsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stopNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stopTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default BusTrackingScreen;