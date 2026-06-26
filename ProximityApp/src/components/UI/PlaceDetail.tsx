import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Place } from '../../models/Place';
import { theme } from '../../utils/theme';
import { getRatingColor, formatCategory } from '../../utils/helpers';
import RatingManager from '../../services/RatingManager';

interface PlaceDetailProps {
  place: Place | null;
  isVisible: boolean;
  onClose: () => void;
  onMarkToggle: (placeId: number) => void;
  onRatingSubmit: (placeId: number, rating: number) => void;
  allPlaces: Place[];
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({
  place,
  isVisible,
  onClose,
  onMarkToggle,
  onRatingSubmit,
  allPlaces,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  useEffect(() => {
    if (place) {
      loadUserRating(place.id);
      setIsRatingSubmitted(false);
    }
  }, [place]);

  const loadUserRating = async (placeId: number) => {
    setIsLoadingRating(true);
    try {
      const rating = await RatingManager.getUserRating(placeId);
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading user rating:', error);
    } finally {
      setIsLoadingRating(false);
    }
  };

  if (!place) return null;

  const avgRating = place.getAverageRating();
  const bubbleColor = getRatingColor(avgRating);
  const googleColor = getRatingColor(place.googleRating);
  const categoryLabel = formatCategory(place.category);
  const recentReviewCount = Math.ceil((place.googleReviewCount || 0) * 0.25);

  const handleMarkToggle = () => {
    onMarkToggle(place.id);
  };

  const handleRatingSubmit = (rating: number) => {
    onRatingSubmit(place.id, rating);
    setIsRatingSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place.name + ' Leamington Spa'
    )}`;
    Linking.openURL(url);
  };

  const openGoogleImages = () => {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
      place.name + ' Leamington Spa'
    )}`;
    Linking.openURL(url);
  };

  const nextPhoto = () => {
    if (place.photoUrls.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % place.photoUrls.length);
    }
  };

  const prevPhoto = () => {
    if (place.photoUrls.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? place.photoUrls.length - 1 : prev - 1
      );
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Photo Hero */}
          <View style={styles.photoHero}>
            {place.photoUrls.length > 0 ? (
              <>
                <Image
                  source={{ uri: place.photoUrls[currentPhotoIndex] }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                {place.photoUrls.length > 1 && (
                  <>
                    <TouchableOpacity style={styles.photoNavLeft} onPress={prevPhoto}>
                      <Text style={styles.photoNavText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoNavRight} onPress={nextPhoto}>
                      <Text style={styles.photoNavText}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.photoCounter}>
                      <Text style={styles.photoCounterText}>
                        {currentPhotoIndex + 1} / {place.photoUrls.length}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.fallbackIcon}>📸</Text>
                <TouchableOpacity onPress={openGoogleImages}>
                  <Text style={styles.viewPhotosButton}>🔍 View on Google</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.nameRow}>
              <View>
                <Text style={styles.name}>{place.name}</Text>
                <Text style={styles.category}>{categoryLabel}</Text>
              </View>
            </View>

            {/* Dual Bubbles */}
            <View style={styles.dualBubbles}>
              <View style={styles.bubbleCol}>
                <View style={styles.bubbleWrap}>
                  <View style={[styles.bubbleRing, { borderColor: bubbleColor }]} />
                  <View style={[styles.bubbleCircle, { backgroundColor: bubbleColor }]}>
                    <Text style={styles.bubbleScore}>{avgRating.toFixed(1)}</Text>
                  </View>
                </View>
                <View style={styles.bubbleText}>
                  <Text style={styles.bubbleLabel}>This month</Text>
                  <Text style={styles.bubbleCount}>{recentReviewCount} reviews</Text>
                </View>
              </View>

              <View style={styles.bubbleCol}>
                <View style={styles.bubbleWrap}>
                  <View style={[styles.bubbleRing, { borderColor: googleColor }]} />
                  <View style={[styles.bubbleCircle, { backgroundColor: googleColor }]}>
                    <Text style={styles.bubbleScore}>
                      {(place.googleRating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.bubbleText}>
                  <Text style={styles.bubbleLabel}>All Time</Text>
                  <Text style={styles.bubbleCount}>
                    {(place.googleReviewCount || 0).toLocaleString()} reviews
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{place.description}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.mapsButton} onPress={openGoogleMaps}>
                <Text style={styles.mapsButtonText}>📍 Open in Google Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.markButton, place.isMarked && styles.markButtonActive]}
                onPress={handleMarkToggle}
              >
                <Text style={styles.markButtonText}>
                  {place.isMarked ? '⭐ Marked' : '☆ Mark Place'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rating Section */}
            {!isRatingSubmitted && !isLoadingRating && (
              <View style={styles.ratingSection}>
                {userRating !== null && (
                  <Text style={styles.previousRating}>
                    Your rating: ⭐ {userRating.toFixed(1)}
                  </Text>
                )}
                <Text style={styles.ratingLabel}>
                  Rate this place: ⭐ {userRating !== null ? userRating.toFixed(1) : '?'}
                </Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderMin}>1</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={5}
                    step={0.1}
                    value={userRating || 3}
                    onValueChange={(value: number) => {
                      // Update rating preview
                    }}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.border}
                    thumbTintColor={theme.colors.primary}
                  />
                  <Text style={styles.sliderMax}>5</Text>
                </View>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleRatingSubmit(userRating || 3)}
                >
                  <Text style={styles.submitButtonText}>
                    {userRating !== null ? 'Update Rating' : 'Submit Rating'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading State */}
            {isLoadingRating && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your rating...</Text>
              </View>
            )}

            {/* Success Message */}
            {isRatingSubmitted && (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>Rating submitted!</Text>
                <Text style={styles.successRating}>⭐ {userRating?.toFixed(1)}</Text>
              </View>
            )}

            {/* Reviews Section */}
            {place.reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>Recent Reviews</Text>
                {place.reviews.slice(0, 3).map((review, index) => (
                  <View key={index} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <Text style={styles.reviewStars}>
                        {'★'.repeat(Math.round(review.rating))}
                        {'☆'.repeat(5 - Math.round(review.rating))}
                      </Text>
                      <Text style={styles.reviewTime}>{review.time}</Text>
                    </View>
                    <Text style={styles.reviewText}>{review.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  photoHero: {
    width: '100%',
    height: 280,
    backgroundColor: '#0a0416',
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoNavLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -19 }],
    backgroundColor: 'rgba(0,0,0,0.52)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNavRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -19 }],
    backgroundColor: 'rgba(0,0,0,0.52)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNavText: {
    color: '#fff',
    fontSize: 26,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: 'rgba(0,0,0,0.58)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  photoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a0b3d',
  },
  fallbackIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  viewPhotosButton: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 8,
  },
  content: {
    padding: 20,
    paddingTop: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(76,42,159,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  nameRow: {
    marginBottom: 12,
    paddingRight: 40,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textTitle,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dualBubbles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  bubbleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bubbleWrap: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  bubbleRing: {
    position: 'absolute',
    inset: -6,
    borderRadius: 50,
    borderWidth: 2,
    opacity: 0.35,
  },
  bubbleCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  bubbleScore: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bubbleText: {
    flexDirection: 'column',
    gap: 2,
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    letterSpacing: 0.6,
  },
  bubbleCount: {
    fontSize: 11,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mapsButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  markButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  markButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  markButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSection: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76,42,159,0.1)',
    borderRadius: 8,
  },
  previousRating: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 48,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textTitle,
  },
  successRating: {
    fontSize: 20,
    color: theme.colors.primary,
    marginTop: 4,
  },
  reviewsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  reviewsTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  reviewItem: {
    backgroundColor: 'rgba(45,27,105,0.45)',
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textLabel,
    flex: 1,
  },
  reviewStars: {
    fontSize: 11,
    color: '#facc15',
  },
  reviewTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  reviewText: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
  },
});

export default PlaceDetail;