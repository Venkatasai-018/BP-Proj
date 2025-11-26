import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { feedbackService } from '../../services/api';

export default function FeedbackDashboard() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
  });

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getFeedback();
      setFeedbacks(data);
      
      // Calculate statistics
      const total = data.length;
      const avgRating = total > 0 
        ? (data.reduce((sum: number, f: any) => sum + f.rating, 0) / total).toFixed(1)
        : 0;
      
      const excellent = data.filter((f: any) => f.rating === 5).length;
      const good = data.filter((f: any) => f.rating === 4).length;
      const average = data.filter((f: any) => f.rating === 3).length;
      const poor = data.filter((f: any) => f.rating <= 2).length;
      
      setStats({ total, avgRating: parseFloat(avgRating), excellent, good, average, poor });
    } catch (error) {
      Alert.alert('Error', 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return 'emoticon-happy';
    if (rating >= 3) return 'emoticon-neutral';
    return 'emoticon-sad';
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      'Service': 'room-service',
      'Punctuality': 'clock-check',
      'Cleanliness': 'broom',
      'Driver Behavior': 'account-tie',
      'Bus Condition': 'bus',
      'Other': 'comment-text',
    };
    return icons[category] || 'comment-text';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <MaterialCommunityIcons name="comment-multiple" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Feedback</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="star" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <MaterialCommunityIcons name="emoticon-happy" size={32} color="#10b981" />
            <Text style={styles.statValue}>{stats.excellent}</Text>
            <Text style={styles.statLabel}>Excellent</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
            <MaterialCommunityIcons name="emoticon-sad" size={32} color="#ef4444" />
            <Text style={styles.statValue}>{stats.poor}</Text>
            <Text style={styles.statLabel}>Needs Attention</Text>
          </View>
        </View>

        {/* Rating Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating Distribution</Text>
          <View style={styles.distributionCard}>
            <View style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>⭐⭐⭐⭐⭐ Excellent</Text>
              <View style={styles.distributionBarContainer}>
                <View style={[styles.distributionBar, { width: `${(stats.excellent / stats.total * 100) || 0}%`, backgroundColor: '#10b981' }]} />
              </View>
              <Text style={styles.distributionValue}>{stats.excellent}</Text>
            </View>

            <View style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>⭐⭐⭐⭐ Good</Text>
              <View style={styles.distributionBarContainer}>
                <View style={[styles.distributionBar, { width: `${(stats.good / stats.total * 100) || 0}%`, backgroundColor: '#3b82f6' }]} />
              </View>
              <Text style={styles.distributionValue}>{stats.good}</Text>
            </View>

            <View style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>⭐⭐⭐ Average</Text>
              <View style={styles.distributionBarContainer}>
                <View style={[styles.distributionBar, { width: `${(stats.average / stats.total * 100) || 0}%`, backgroundColor: '#f59e0b' }]} />
              </View>
              <Text style={styles.distributionValue}>{stats.average}</Text>
            </View>

            <View style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>⭐⭐ Poor</Text>
              <View style={styles.distributionBarContainer}>
                <View style={[styles.distributionBar, { width: `${(stats.poor / stats.total * 100) || 0}%`, backgroundColor: '#ef4444' }]} />
              </View>
              <Text style={styles.distributionValue}>{stats.poor}</Text>
            </View>
          </View>
        </View>

        {/* Feedback List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Feedback</Text>
          {feedbacks.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={[styles.feedbackIcon, { backgroundColor: `${getRatingColor(feedback.rating)}20` }]}>
                  <MaterialCommunityIcons 
                    name={getRatingIcon(feedback.rating)} 
                    size={28} 
                    color={getRatingColor(feedback.rating)} 
                  />
                </View>
                <View style={styles.feedbackInfo}>
                  <View style={styles.feedbackTop}>
                    <Text style={styles.feedbackStudent}>Student #{feedback.student_id}</Text>
                    <View style={styles.ratingBadge}>
                      <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
                      <Text style={styles.ratingText}>{feedback.rating}/5</Text>
                    </View>
                  </View>
                  <View style={styles.categoryRow}>
                    <MaterialCommunityIcons 
                      name={getCategoryIcon(feedback.category)} 
                      size={16} 
                      color="#64748b" 
                    />
                    <Text style={styles.categoryText}>{feedback.category}</Text>
                  </View>
                </View>
              </View>
              
              {feedback.comment && (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentText}>{feedback.comment}</Text>
                </View>
              )}

              <View style={styles.feedbackFooter}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#94a3b8" />
                  <Text style={styles.dateText}>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {feedback.bus_id && (
                  <View style={styles.busContainer}>
                    <MaterialCommunityIcons name="bus" size={14} color="#94a3b8" />
                    <Text style={styles.busText}>Bus #{feedback.bus_id}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {feedbacks.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="comment-remove" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No feedback yet</Text>
            </View>
          )}
        </View>
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
    backgroundColor: '#ec4899',
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  distributionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionLabel: {
    width: 140,
    fontSize: 14,
    color: '#64748b',
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  distributionBar: {
    height: '100%',
    borderRadius: 4,
  },
  distributionValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
  feedbackCard: {
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
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedbackIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedbackInfo: {
    flex: 1,
  },
  feedbackTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackStudent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  commentContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  busContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
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
});
