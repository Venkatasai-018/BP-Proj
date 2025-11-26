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
import { busService } from '../../services/api';

export default function BusManagement() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    capacity: '',
    model: '',
    registration_number: '',
    status: 'Active',
  });

  const loadBuses = async () => {
    setLoading(true);
    try {
      const data = await busService.getBuses();
      setBuses(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const handleCreate = async () => {
    if (!formData.bus_number || !formData.capacity || !formData.model || !formData.registration_number) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingBus) {
        await busService.updateBus(editingBus.id, {
          bus_number: formData.bus_number,
          capacity: parseInt(formData.capacity),
          status: formData.status,
        });
        Alert.alert('Success', 'Bus updated successfully');
      } else {
        await busService.createBus({
          bus_number: formData.bus_number,
          capacity: parseInt(formData.capacity),
          model: formData.model,
          registration_number: formData.registration_number,
          status: formData.status,
        });
        Alert.alert('Success', 'Bus created successfully');
      }
      setModalVisible(false);
      setFormData({ bus_number: '', capacity: '', model: '', registration_number: '', status: 'Active' });
      setEditingBus(null);
      loadBuses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${editingBus ? 'update' : 'create'} bus`);
    }
  };

  const handleEdit = (bus: any) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      capacity: bus.capacity.toString(),
      model: bus.model,
      registration_number: bus.registration_number,
      status: bus.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this bus?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await busService.deleteBus(id);
            Alert.alert('Success', 'Bus deleted successfully');
            loadBuses();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete bus');
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
        <Text style={styles.headerTitle}>Bus Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {buses.map((bus) => (
          <View key={bus.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.busIcon}>
                <MaterialCommunityIcons name="bus" size={32} color="#3b82f6" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.busNumber}>{bus.bus_number}</Text>
                <Text style={styles.busDetails}>Model: {bus.model}</Text>
                <Text style={styles.busDetails}>Reg: {bus.registration_number}</Text>
                <Text style={styles.busDetails}>Capacity: {bus.capacity}</Text>
                <Text style={[styles.status, bus.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  {bus.status}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(bus)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(bus.id)} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {buses.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bus-alert" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No buses found</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Bus Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBus ? 'Edit Bus' : 'Add New Bus'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Bus Number"
              value={formData.bus_number}
              onChangeText={(text) => setFormData({ ...formData, bus_number: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Capacity"
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Model (e.g., Tata Starbus)"
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Registration Number (e.g., TN01AB1234)"
              value={formData.registration_number}
              onChangeText={(text) => setFormData({ ...formData, registration_number: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setModalVisible(false);
                setEditingBus(null);
                setFormData({ bus_number: '', capacity: '', model: '', registration_number: '', status: 'Active' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>{editingBus ? 'Update' : 'Create'}</Text>
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
    backgroundColor: '#3b82f6',
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
  busIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  busDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusActive: {
    color: '#10b981',
  },
  statusInactive: {
    color: '#ef4444',
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
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
