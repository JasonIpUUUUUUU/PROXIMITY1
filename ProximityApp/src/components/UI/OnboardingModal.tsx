import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../utils/theme';

interface OnboardingModalProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onDismiss }) => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem('welcome_seen');
      setHasSeenWelcome(!!seen);
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem('welcome_seen', 'true');
      setHasSeenWelcome(true);
      onDismiss();
    } catch (error) {
      console.error('Error saving welcome status:', error);
    }
  };

  if (hasSeenWelcome) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.logo}>📍</Text>
              <Text style={styles.title}>
                Welcome to <Text style={styles.accent}>Proximity</Text>
              </Text>
              <Text style={styles.subtitle}>
                Your local guide to Leamington Spa's best bars, pubs and bites
              </Text>
            </View>

            <View style={styles.steps}>
              <View style={styles.step}>
                <Text style={styles.stepIcon}>🔍</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Search where you want to go</Text>
                  <Text style={styles.stepDesc}>
                    Try <Text style={styles.stepEmphasis}>bar</Text>,{' '}
                    <Text style={styles.stepEmphasis}>pub</Text> or{' '}
                    <Text style={styles.stepEmphasis}>quick munch</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepIcon}>🫧</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Tap a bubble to see details</Text>
                  <Text style={styles.stepDesc}>Photos, reviews and community ratings</Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepIcon}>⭐</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Mark places you want to go</Text>
                  <Text style={styles.stepDesc}>Saved to your list on the right</Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepIcon}>🚶</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get walking!</Text>
                  <Text style={styles.stepDesc}>Tap a saved spot to fly straight to it</Text>
                </View>
              </View>
            </View>

            <View style={styles.metrics}>
              <Text style={styles.metricsTitle}>Reading the bubbles</Text>
              <View style={styles.metricsRow}>
                <View style={styles.metricsCol}>
                  <Text style={styles.metricsLabel}>Colour = avg rating</Text>
                  <View style={styles.colorBar}>
                    <View style={[styles.colorStop, { backgroundColor: '#e53935' }]} />
                    <View style={[styles.colorStop, { backgroundColor: '#fb8c00' }]} />
                    <View style={[styles.colorStop, { backgroundColor: '#fdd835' }]} />
                    <View style={[styles.colorStop, { backgroundColor: '#7cb342' }]} />
                    <View style={[styles.colorStop, { backgroundColor: '#2e7d32' }]} />
                  </View>
                  <View style={styles.metricsEnds}>
                    <Text style={styles.metricsEnd}>lower</Text>
                    <Text style={styles.metricsEnd}>higher</Text>
                  </View>
                </View>

                <View style={styles.metricsCol}>
                  <Text style={styles.metricsLabel}>Size = no. of reviews</Text>
                  <View style={styles.sizeVisual}>
                    <View style={styles.sizeBubbles}>
                      <View style={[styles.sizeBubble, { width: 10, height: 10 }]} />
                      <View style={[styles.sizeBubble, { width: 16, height: 16 }]} />
                      <View style={[styles.sizeBubble, { width: 22, height: 22 }]} />
                      <View style={[styles.sizeBubble, { width: 30, height: 30 }]} />
                    </View>
                    <View style={styles.metricsEnds}>
                      <Text style={styles.metricsEnd}>fewer</Text>
                      <Text style={styles.metricsEnd}>more</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissButtonText}>Let's explore →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,3,20,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: theme.colors.textTitle,
    marginBottom: 8,
  },
  accent: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
  },
  steps: {
    marginBottom: 26,
    gap: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'rgba(76,42,159,0.14)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,42,159,0.35)',
  },
  stepIcon: {
    fontSize: 22,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.textTitle,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12,
    color: theme.colors.text,
  },
  stepEmphasis: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  metrics: {
    backgroundColor: 'rgba(76,42,159,0.14)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(76,42,159,0.35)',
  },
  metricsTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    color: theme.colors.textLabel,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metricsCol: {
    flex: 1,
  },
  metricsLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  colorBar: {
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    height: 9,
    marginBottom: 4,
  },
  colorStop: {
    flex: 1,
  },
  sizeVisual: {
    gap: 6,
  },
  sizeBubbles: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sizeBubble: {
    backgroundColor: 'rgba(168,85,247,0.55)',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 50,
  },
  metricsEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricsEnd: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  dismissButton: {
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});

export default OnboardingModal;