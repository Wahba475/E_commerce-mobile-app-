import { View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar } from "react-native"
import { Stack } from "expo-router"
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';


const { width, height } = Dimensions.get('window')
const router = useRouter();
function WelcomeScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2d2d2d']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Discover the latest</Text>
            <Text style={styles.titleAccent}>electronics & gadgets</Text>
            <Text style={styles.subtitle}>
              Shop premium smartphones, laptops, gaming gear, 
              and smart home devices with exclusive deals 
              and fast delivery to your doorstep.
            </Text>
          </View>

          {/* 3D Illustration */}
          <View style={styles.illustrationContainer}>
            {/* Base Platform */}
            <View style={styles.basePlatform}>
              <LinearGradient
                colors={['#333', '#222']}
                style={styles.platformGradient}
              />
            </View>

            {/* Middle Ring */}
            <View style={styles.middleRing}>
              <LinearGradient
                colors={['#444', '#333']}
                style={styles.ringGradient}
              />
            </View>

            {/* Top Ring */}
            <View style={styles.topRing}>
              <LinearGradient
                colors={['#555', '#444']}
                style={styles.ringGradient}
              />
            </View>

            {/* Central Card */}
            <View style={styles.centralCard}>
              <LinearGradient
                colors={['#ffffff', '#f0f0f0']}
                style={styles.cardGradient}
              >
                <View style={styles.cardChip}>
                  <LinearGradient
                    colors={['#gold', '#ffd700']}
                    style={styles.chipGradient}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Floating Elements */}
            <View style={styles.floatingElement1}>
              <LinearGradient
                colors={['#666', '#555']}
                style={styles.floatingGradient}
              />
            </View>
            <View style={styles.floatingElement2}>
              <LinearGradient
                colors={['#777', '#666']}
                style={styles.floatingGradient}
              />
            </View>
            <View style={styles.floatingElement3}>
              <LinearGradient
                colors={['#888', '#777']}
                style={styles.floatingGradient}
              />
            </View>

            {/* Accent Card */}
            <View style={styles.accentCard}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                style={styles.accentGradient}
              />
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity  style={styles.continueButton} activeOpacity={0.8} onPress={() => router.push('/signin')}>
            <Text style={styles.continueText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 42,
  },
  titleAccent: {
    fontSize: 36,
    fontWeight: '700',
    color: '#666',
    lineHeight: 42,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    fontWeight: '400',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  basePlatform: {
    width: 120,
    height: 60,
    position: 'absolute',
    bottom: 0,
  },
  platformGradient: {
    flex: 1,
    borderRadius: 60,
    transform: [{ perspective: 1000 }, { rotateX: '75deg' }],
  },
  middleRing: {
    width: 100,
    height: 50,
    position: 'absolute',
    bottom: 30,
  },
  topRing: {
    width: 80,
    height: 40,
    position: 'absolute',
    bottom: 60,
  },
  ringGradient: {
    flex: 1,
    borderRadius: 40,
    transform: [{ perspective: 1000 }, { rotateX: '75deg' }],
  },
  centralCard: {
    width: 60,
    height: 38,
    position: 'absolute',
    bottom: 70,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
  },
  cardChip: {
    width: 16,
    height: 12,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  chipGradient: {
    flex: 1,
    borderRadius: 3,
  },
  floatingElement1: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 20,
    left: 40,
    borderRadius: 4,
  },
  floatingElement2: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 60,
    right: 50,
    borderRadius: 4,
  },
  floatingElement3: {
    width: 18,
    height: 18,
    position: 'absolute',
    bottom: 120,
    left: 30,
    borderRadius: 4,
  },
  floatingGradient: {
    flex: 1,
    borderRadius: 4,
  },
  accentCard: {
    width: 40,
    height: 25,
    position: 'absolute',
    top: 40,
    right: 20,
    borderRadius: 6,
    transform: [{ rotate: '15deg' }],
  },
  accentGradient: {
    flex: 1,
    borderRadius: 6,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default WelcomeScreen