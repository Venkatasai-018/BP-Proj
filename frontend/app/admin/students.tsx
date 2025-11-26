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

export default function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    phone: '',
    route_id: '',
  });

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.roll_number) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!editingStudent && !formData.password) {
      Alert.alert('Error', 'Password is required for new students');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        roll_number: formData.roll_number,
        phone: formData.phone || null,
        route_id: formData.route_id ? parseInt(formData.route_id) : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingStudent) {
        await adminService.updateStudent(editingStudent.id, payload);
        Alert.alert('Success', 'Student updated successfully');
      } else {
        await adminService.createStudent(payload);
        Alert.alert('Success', 'Student created successfully');
      }
      setModalVisible(false);
      setFormData({ name: '', email: '', password: '', roll_number: '', phone: '', route_id: '' });
      setEditingStudent(null);
      loadStudents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${editingStudent ? 'update' : 'create'} student`);
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '',
      roll_number: student.roll_number,
      phone: student.phone || '',
      route_id: student.route_id ? student.route_id.toString() : '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteStudent(id);
            Alert.alert('Success', 'Student deleted successfully');
            loadStudents();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete student');
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
        <Text style={styles.headerTitle}>Student Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {students.map((student) => (
          <View key={student.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.studentIcon}>
                <MaterialCommunityIcons name="account-school" size={32} color="#10b981" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={16} color="#64748b" />
                  <Text style={styles.infoText}>{student.roll_number}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="email" size={16} color="#64748b" />
                  <Text style={styles.infoText}>{student.email}</Text>
                </View>
                {student.phone && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{student.phone}</Text>
                  </View>
                )}
                {student.route_id && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="routes" size={16} color="#64748b" />
                    <Text style={styles.infoText}>Route #{student.route_id}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(student)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(student.id)} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {students.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-remove" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Student Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingStudent ? 'Edit Student' : 'Add New Student'}</Text>

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
                placeholder={editingStudent ? "Password (leave blank to keep current)" : "Password *"}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Roll Number *"
                value={formData.roll_number}
                onChangeText={(text) => setFormData({ ...formData, roll_number: text })}
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
                placeholder="Route ID (Optional)"
                value={formData.route_id}
                onChangeText={(text) => setFormData({ ...formData, route_id: text })}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => {
                  setModalVisible(false);
                  setEditingStudent(null);
                  setFormData({ name: '', email: '', password: '', roll_number: '', phone: '', route_id: '' });
                }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                  <Text style={styles.createButtonText}>{editingStudent ? 'Update' : 'Create'}</Text>
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
    backgroundColor: '#10b981',
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
  studentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  studentName: {
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
    backgroundColor: '#10b981',
    marginLeft: 8,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
