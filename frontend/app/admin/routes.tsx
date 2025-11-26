import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { routeService } from '../../services/api';

export default function RouteManagement() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [formData, setFormData] = useState({
    route_name: '',
    description: '',
    stops: [] as any[],
  });
  const [stopForm, setStopForm] = useState({
    stop_name: '',
    latitude: '',
    longitude: '',
  });

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCreate = async () => {
    if (!formData.route_name || !formData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (formData.stops.length === 0) {
      Alert.alert('Error', 'Please add at least one stop');
      return;
    }

    try {
      if (editingRoute) {
        await routeService.updateRoute(editingRoute.id, formData);
        Alert.alert('Success', 'Route updated successfully');
      } else {
        await routeService.createRoute(formData);
        Alert.alert('Success', 'Route created successfully');
      }
      setModalVisible(false);
      setEditingRoute(null);
      setFormData({ route_name: '', description: '', stops: [] });
      setStopForm({ stop_name: '', latitude: '', longitude: '' });
      loadRoutes();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${editingRoute ? 'update' : 'create'} route`);
    }
  };

  const handleEdit = (route: any) => {
    setEditingRoute(route);
    setFormData({
      route_name: route.route_name,
      description: route.description,
      stops: route.stops || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this route?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await routeService.deleteRoute(id);
            Alert.alert('Success', 'Route deleted successfully');
            loadRoutes();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete route');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {routes.map((route) => (
          <View key={route.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.routeIcon}>
                <MaterialCommunityIcons name="routes" size={32} color="#8b5cf6" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.routeName}>{route.route_name}</Text>
                <Text style={styles.routeDescription}>{route.description}</Text>
                <View style={styles.pointRow}>
                  <MaterialCommunityIcons name="map-marker-multiple" size={16} color="#8b5cf6" />
                  <Text style={styles.pointText}>
                    {route.stops?.length || 0} stops
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(route)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#8b5cf6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(route.id)} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {routes.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No routes found</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Route Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingRoute ? 'Edit Route' : 'Add New Route'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Route Name"
              value={formData.route_name}
              onChangeText={(text) => setFormData({ ...formData, route_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />

            {/* Stops Section */}
            <Text style={styles.sectionTitle}>Route Stops</Text>
            <View style={styles.stopsList}>
              {formData.stops.map((stop: any, index: number) => (
                <View key={index} style={styles.stopItem}>
                  <Text style={styles.stopText}>{index + 1}. {stop.stop_name}</Text>
                  <TouchableOpacity onPress={() => {
                    setFormData({ ...formData, stops: formData.stops.filter((_: any, i: number) => i !== index) });
                  }}>
                    <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Stop Form */}
            <View style={styles.addStopSection}>
              <Text style={styles.addStopTitle}>Add Stop</Text>
              <TextInput
                style={styles.input}
                placeholder="Stop Name"
                value={stopForm.stop_name}
                onChangeText={(text) => setStopForm({ ...stopForm, stop_name: text })}
              />
              <View style={styles.coordRow}>
                <TextInput
                  style={[styles.input, styles.coordInput]}
                  placeholder="Latitude"
                  value={stopForm.latitude}
                  onChangeText={(text) => setStopForm({ ...stopForm, latitude: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.coordInput]}
                  placeholder="Longitude"
                  value={stopForm.longitude}
                  onChangeText={(text) => setStopForm({ ...stopForm, longitude: text })}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity 
                style={styles.addStopButton}
                onPress={() => {
                  if (!stopForm.stop_name || !stopForm.latitude || !stopForm.longitude) {
                    Alert.alert('Error', 'Please fill all stop fields');
                    return;
                  }
                  const newStop = {
                    stop_name: stopForm.stop_name,
                    latitude: parseFloat(stopForm.latitude),
                    longitude: parseFloat(stopForm.longitude),
                    order: formData.stops.length + 1,
                  };
                  setFormData({ ...formData, stops: [...formData.stops, newStop] });
                  setStopForm({ stop_name: '', latitude: '', longitude: '' });
                }}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.addStopButtonText}>Add Stop</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setModalVisible(false);
                setEditingRoute(null);
                setFormData({ route_name: '', description: '', stops: [] });
                setStopForm({ stop_name: '', latitude: '', longitude: '' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>{editingRoute ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#8b5cf6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  routePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    marginLeft: 8,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 8,
  },
  stopsList: {
    marginBottom: 16,
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  stopText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  addStopSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addStopTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 12,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coordInput: {
    flex: 1,
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addStopButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
