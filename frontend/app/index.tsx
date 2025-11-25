import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563eb', '#1e40af', '#1e3a8a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="bus-school" size={80} color="#fff" />
          <Text style={styles.title}>TCE EduRide</Text>
          <Text style={styles.subtitle}>Smart Bus Tracking System</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/admin/login')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#ef4444' }]}>
              <MaterialCommunityIcons name="shield-account" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Admin</Text>
            <Text style={styles.cardSubtitle}>Manage System</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/student/login')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10b981' }]}>
              <MaterialCommunityIcons name="account-school" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Student</Text>
            <Text style={styles.cardSubtitle}>Track Your Bus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/driver/login')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#f59e0b' }]}>
              <MaterialCommunityIcons name="steering" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Driver</Text>
            <Text style={styles.cardSubtitle}>Update Location</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thiagarajar College of Engineering</Text>
          <Text style={styles.footerSubtext}>Version 1.0.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    position: 'absolute',
    bottom: 25,
    left: 115,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
});
