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
import { adminService } from '../../services/api';

export default function DriverManagement() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    license_number: '',
    bus_id: '',
  });

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDrivers();
      setDrivers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.license_number) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!editingDriver && !formData.password) {
      Alert.alert('Error', 'Password is required for new drivers');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        license_number: formData.license_number,
        bus_id: formData.bus_id ? parseInt(formData.bus_id) : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingDriver) {
        await adminService.updateDriver(editingDriver.id, payload);
        Alert.alert('Success', 'Driver updated successfully');
      } else {
        await adminService.createDriver(payload);
        Alert.alert('Success', 'Driver created successfully');
      }
      setModalVisible(false);
      setFormData({ name: '', email: '', password: '', phone: '', license_number: '', bus_id: '' });
      setEditingDriver(null);
      loadDrivers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${editingDriver ? 'update' : 'create'} driver`);
    }
  };

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: '',
      phone: driver.phone || '',
      license_number: driver.license_number,
      bus_id: driver.bus_id ? driver.bus_id.toString() : '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteDriver(id);
            Alert.alert('Success', 'Driver deleted successfully');
            loadDrivers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete driver');
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
        <Text style={styles.headerTitle}>Driver Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {drivers.map((driver) => (
          <View key={driver.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.driverIcon}>
                <MaterialCommunityIcons name="account-tie" size={32} color="#f59e0b" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={16} color="#64748b" />
                  <Text style={styles.infoText}>{driver.license_number}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="email" size={16} color="#64748b" />
                  <Text style={styles.infoText}>{driver.email}</Text>
                </View>
                {driver.phone && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{driver.phone}</Text>
                  </View>
                )}
                {driver.bus_id && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="bus" size={16} color="#64748b" />
                    <Text style={styles.infoText}>Bus #{driver.bus_id}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(driver)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#f59e0b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(driver.id)} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {drivers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-remove" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No drivers found</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Driver Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder={editingDriver ? "Password (leave blank to keep current)" : "Password *"}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="License Number *"
                value={formData.license_number}
                onChangeText={(text) => setFormData({ ...formData, license_number: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (Optional)"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Bus ID (Optional)"
                value={formData.bus_id}
                onChangeText={(text) => setFormData({ ...formData, bus_id: text })}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => {
                  setModalVisible(false);
                  setEditingDriver(null);
                  setFormData({ name: '', email: '', password: '', phone: '', license_number: '', bus_id: '' });
                }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                  <Text style={styles.createButtonText}>{editingDriver ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: '#f59e0b',
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
    alignItems: 'flex-start',
  },
  driverIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
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
    maxHeight: '80%',
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
    backgroundColor: '#f59e0b',
    marginLeft: 8,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
