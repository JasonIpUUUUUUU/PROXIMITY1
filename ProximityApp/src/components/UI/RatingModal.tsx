import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { theme } from '../../utils/theme';
import { getRatingColor } from '../../utils/helpers';

interface RatingModalProps {
  isVisible: boolean;
  placeName: string;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  placeName,
  onClose,
  onSubmit,
  initialRating = 3,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(rating);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const getRatingEmoji = (value: number) => {
    if (value < 2) return '😞';
    if (value < 3) return '😐';
    if (value < 4) return '🙂';
    if (value < 4.5) return '😊';
    return '🤩';
  };

  const getRatingLabel = (value: number) => {
    if (value < 2) return 'Poor';
    if (value < 3) return 'Okay';
    if (value < 4) return 'Good';
    if (value < 4.5) return 'Great';
    return 'Excellent!';
  };

  const color = getRatingColor(rating);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>How was</Text>
          <Text style={styles.placeName}>{placeName}</Text>
          <Text style={styles.subtitle}>Share your experience!</Text>

          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingEmoji}>
              {getRatingEmoji(rating)}
            </Text>
            <Text style={[styles.ratingValue, { color }]}>
              {rating.toFixed(1)}
            </Text>
            <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderMin}>1</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={0.1}
              value={rating}
              onValueChange={setRating}
              minimumTrackTintColor={color}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={color}
            />
            <Text style={styles.sliderMax}>5</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,3,20,0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  container: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
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
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76,42,159,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  icon: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textTitle,
    textAlign: 'center',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  ratingLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMin: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  sliderMax: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

export default RatingModal;