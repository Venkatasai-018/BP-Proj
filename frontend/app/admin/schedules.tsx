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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scheduleService, busService, routeService } from '../../services/api';

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
    days_of_week: [] as string[],
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadSchedules = async () => {
    console.log('Loading schedules...');
    setLoading(true);
    try {
      const data = await scheduleService.getSchedules();
      console.log('Schedules loaded:', data);
      setSchedules(data);
    } catch (error: any) {
      console.error('Load schedules error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to load schedules';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMsg}`);
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async () => {
    if (!formData.route_id || !formData.bus_id || !formData.departure_time) {
      if (Platform.OS === 'web') {
        alert('Please fill all required fields');
      } else {
        Alert.alert('Error', 'Please fill all required fields');
      }
      return;
    }

    if (formData.days_of_week.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please select at least one day');
      } else {
        Alert.alert('Error', 'Please select at least one day');
      }
      return;
    }

    console.log('Creating/updating schedule...');
    try {
      const scheduleData = {
        route_id: parseInt(formData.route_id),
        bus_id: parseInt(formData.bus_id),
        departure_time: formData.departure_time,
        days_of_week: formData.days_of_week,
      };
      console.log('Schedule data:', scheduleData);

      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule.id, scheduleData);
        console.log('Schedule updated successfully');
        if (Platform.OS === 'web') {
          alert('Schedule updated successfully');
        } else {
          Alert.alert('Success', 'Schedule updated successfully');
        }
      } else {
        await scheduleService.createSchedule(scheduleData);
        console.log('Schedule created successfully');
        if (Platform.OS === 'web') {
          alert('Schedule created successfully');
        } else {
          Alert.alert('Success', 'Schedule created successfully');
        }
      }
      setModalVisible(false);
      setFormData({ route_id: '', bus_id: '', departure_time: '', days_of_week: [] });
      setEditingSchedule(null);
      loadSchedules();
    } catch (error: any) {
      console.error('Schedule create/update error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || `Failed to ${editingSchedule ? 'update' : 'create'} schedule`;
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMsg}`);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleEdit = (schedule: any) => {
    console.log('Editing schedule:', schedule);
    setEditingSchedule(schedule);
    setFormData({
      route_id: schedule.route_id?.toString() || '',
      bus_id: schedule.bus_id?.toString() || '',
      departure_time: schedule.departure_time || '',
      days_of_week: schedule.days_of_week || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    console.log('Delete clicked for schedule ID:', id);
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this schedule?');
      if (!confirmed) {
        console.log('Delete cancelled');
        return;
      }
      
      console.log('Delete confirmed, calling API...');
      try {
        await scheduleService.deleteSchedule(id);
        console.log('Delete successful');
        alert('Schedule deleted successfully');
        loadSchedules();
      } catch (error: any) {
        console.error('Delete error:', error);
        console.error('Error response:', error.response);
        const errorMsg = error.response?.data?.detail || error.message || 'Failed to delete schedule';
        alert(`Error: ${errorMsg}`);
      }
    } else {
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
            } catch (error: any) {
              console.error('Delete error:', error);
              const errorMsg = error.response?.data?.detail || error.message || 'Failed to delete schedule';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]);
    }
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
                <Text style={styles.scheduleTitle}>{schedule.route_name || `Route #${schedule.route_id}`}</Text>
                <Text style={styles.scheduleSubtitle}>{schedule.bus_number || `Bus #${schedule.bus_id}`}</Text>
                <View style={styles.timeRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#06b6d4" />
                  <Text style={styles.timeText}>Departs: {schedule.departure_time}</Text>
                </View>
                <View style={styles.timeRow}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color="#10b981" />
                  <Text style={styles.timeText}>{Array.isArray(schedule.days_of_week) ? schedule.days_of_week.join(', ') : schedule.days_of_week}</Text>
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
              placeholder="Departure Time (HH:MM:SS)"
              value={formData.departure_time}
              onChangeText={(text) => setFormData({ ...formData, departure_time: text })}
            />

            <Text style={styles.label}>Days of Week:</Text>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    formData.days_of_week.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => {
                    const newDays = formData.days_of_week.includes(day)
                      ? formData.days_of_week.filter((d) => d !== day)
                      : [...formData.days_of_week, day];
                    setFormData({ ...formData, days_of_week: newDays });
                  }}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      formData.days_of_week.includes(day) && styles.dayButtonTextSelected,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setModalVisible(false);
                setEditingSchedule(null);
                setFormData({ route_id: '', bus_id: '', departure_time: '', days_of_week: [] });
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
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  dayButtonSelected: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#fff',
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
