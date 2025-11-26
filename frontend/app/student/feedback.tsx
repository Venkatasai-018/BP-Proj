import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { feedbackService } from '../../services/api';

export default function StudentFeedback() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('Service');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: 'Service', icon: 'room-service' },
    { label: 'Punctuality', icon: 'clock-check' },
    { label: 'Cleanliness', icon: 'broom' },
    { label: 'Driver Behavior', icon: 'account-tie' },
    { label: 'Bus Condition', icon: 'bus' },
    { label: 'Other', icon: 'comment-text' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    if (!userData?.id) {
      Alert.alert('Error', 'User data not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        user_id: userData.id,
        user_type: 'student',
        rating: rating,
        category: category,
        message: message.trim(),
      });

      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => {
            setRating(0);
            setCategory('Service');
            setMessage('');
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you rate your experience?</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Below Average'}
              {rating === 1 && 'Poor'}
            </Text>
          )}
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryButton,
                  category === cat.label && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.label)}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={28}
                  color={category === cat.label ? '#fff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.label && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Feedback</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your experience, suggestions, or concerns..."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
