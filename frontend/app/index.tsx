import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="bus-school" size={60} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>TCE EduRide</Text>
          <Text style={styles.subtitle}>Smart Transportation Management System</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#10b981" />
            <Text style={styles.badgeText}>Secure & Real-time</Text>
          </View>
        </Animated.View>

        {/* Role Selection Cards */}
        <Animated.View 
          style={[
            styles.cardsContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/admin/login')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#dc2626', '#991b1b']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="shield-crown" size={36} color="#fff" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Admin Portal</Text>
                  <Text style={styles.cardSubtitle}>Complete System Control</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/student/login')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#059669', '#047857']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="school" size={36} color="#fff" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Student Portal</Text>
                  <Text style={styles.cardSubtitle}>Track Bus & View Routes</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/driver/login')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#d97706', '#b45309']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="steering" size={36} color="#fff" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Driver Portal</Text>
                  <Text style={styles.cardSubtitle}>Update Location & Status</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#3b82f6" />
            <Text style={styles.footerBadgeText}>GPS Enabled</Text>
          </View>
          <Text style={styles.footerText}>Thiagarajar College of Engineering</Text>
          <Text style={styles.footerSubtext}>Madurai • Version 1.0.0</Text>
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
    paddingTop: 50,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    top: 200,
    right: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeText: {
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  footerBadgeText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
