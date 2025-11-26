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
import { scheduleService } from '../../services/api';

export default function ScheduleManagement() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    departure_time: '',
    arrival_time: '',
  });

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async () => {
    if (!formData.route_id || !formData.bus_id || !formData.departure_time || !formData.arrival_time) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule.id, {
          route_id: parseInt(formData.route_id),
          bus_id: parseInt(formData.bus_id),
          departure_time: formData.departure_time,
          arrival_time: formData.arrival_time,
        });
        Alert.alert('Success', 'Schedule updated successfully');
      } else {
        await scheduleService.createSchedule({
          route_id: parseInt(formData.route_id),
          bus_id: parseInt(formData.bus_id),
          departure_time: formData.departure_time,
          arrival_time: formData.arrival_time,
        });
        Alert.alert('Success', 'Schedule created successfully');
      }
      setModalVisible(false);
      setFormData({ route_id: '', bus_id: '', departure_time: '', arrival_time: '' });
      setEditingSchedule(null);
      loadSchedules();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${editingSchedule ? 'update' : 'create'} schedule`);
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormData({
      route_id: schedule.route_id.toString(),
      bus_id: schedule.bus_id.toString(),
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await scheduleService.deleteSchedule(id);
            Alert.alert('Success', 'Schedule deleted successfully');
            loadSchedules();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete schedule');
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
        <Text style={styles.headerTitle}>Schedule Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {schedules.map((schedule) => (
          <View key={schedule.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.scheduleIcon}>
                <MaterialCommunityIcons name="calendar-clock" size={32} color="#06b6d4" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.scheduleTitle}>Route #{schedule.route_id} - Bus #{schedule.bus_id}</Text>
                <View style={styles.timeRow}>
                  <MaterialCommunityIcons name="clock-start" size={16} color="#10b981" />
                  <Text style={styles.timeText}>Depart: {schedule.departure_time}</Text>
                </View>
                <View style={styles.timeRow}>
                  <MaterialCommunityIcons name="clock-end" size={16} color="#ef4444" />
                  <Text style={styles.timeText}>Arrive: {schedule.arrival_time}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(schedule)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#06b6d4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(schedule.id)} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {schedules.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-remove" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No schedules found</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Schedule Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Route ID"
              value={formData.route_id}
              onChangeText={(text) => setFormData({ ...formData, route_id: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Bus ID"
              value={formData.bus_id}
              onChangeText={(text) => setFormData({ ...formData, bus_id: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Departure Time (HH:MM)"
              value={formData.departure_time}
              onChangeText={(text) => setFormData({ ...formData, departure_time: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Arrival Time (HH:MM)"
              value={formData.arrival_time}
              onChangeText={(text) => setFormData({ ...formData, arrival_time: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setModalVisible(false);
                setEditingSchedule(null);
                setFormData({ route_id: '', bus_id: '', departure_time: '', arrival_time: '' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>{editingSchedule ? 'Update' : 'Create'}</Text>
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
    backgroundColor: '#06b6d4',
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
  scheduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#cffafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
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
    backgroundColor: '#06b6d4',
    marginLeft: 8,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
