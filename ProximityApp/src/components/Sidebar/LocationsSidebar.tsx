import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {Place} from '../../models/Place';
import {theme} from '../../utils/theme';
import {getRatingColor, formatCategory} from '../../utils/helpers';

interface LocationsSidebarProps {
  places: Place[];
  markedPlaces: number[];
  onPlaceSelect: (placeIndex: number) => void;
  onPlaceUnmark: (placeIndex: number) => void;
}

const LocationsSidebar: React.FC<LocationsSidebarProps> = ({
  places,
  markedPlaces,
  onPlaceSelect,
  onPlaceUnmark,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(markedPlaces.length > 0);
  }, [markedPlaces]);

  const getMarkedPlaces = () => {
    return places.filter(place => markedPlaces.includes(place.id));
  };

  const handlePlacePress = (placeId: number) => {
    onPlaceSelect(placeId);
  };

  const handleRemove = (placeId: number, event: any) => {
    event.stopPropagation();
    onPlaceUnmark(placeId);
  };

  if (!isVisible) return null;

  const marked = getMarkedPlaces();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Locations to go</Text>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {marked.map(place => {
          const color = getRatingColor(place.getAverageRating());
          const categoryLabel = formatCategory(place.category);

          return (
            <TouchableOpacity
              key={place.id}
              style={[styles.tab, {borderLeftColor: color}]}
              onPress={() => handlePlacePress(place.id)}
              activeOpacity={0.7}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={e => handleRemove(place.id, e)}>
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>

              <View style={styles.tabContent}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCategory}>{categoryLabel}</Text>
              </View>

              <View style={styles.ratingRow}>
                <View style={styles.ratingItem}>
                  <View style={[styles.bubble, {backgroundColor: color}]}>
                    <Text style={styles.bubbleText}>{place.getAverageRating().toFixed(1)}</Text>
                  </View>
                  <View style={styles.ratingText}>
                    <Text style={styles.ratingLabel}>This month</Text>
                    <Text style={styles.ratingCount}>
                      {Math.ceil((place.googleReviewCount || 0) * 0.25)} reviews
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingItem}>
                  <View
                    style={[styles.bubble, {backgroundColor: getRatingColor(place.googleRating)}]}>
                    <Text style={styles.bubbleText}>{(place.googleRating || 0).toFixed(1)}</Text>
                  </View>
                  <View style={styles.ratingText}>
                    <Text style={styles.ratingLabel}>All Time</Text>
                    <Text style={styles.ratingCount}>
                      {(place.googleReviewCount || 0).toLocaleString()} reviews
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.hint}>Hold to zoom in and view</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: Platform.OS === 'ios' ? 80 : 70,
    bottom: 120,
    width: 290,
    paddingRight: 8,
    paddingBottom: 8,
    zIndex: 90,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primaryDark,
    backgroundColor: theme.colors.backgroundPanel,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderTopLeftRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: theme.colors.primary,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 18,
  },
  list: {
    flex: 1,
  },
  tab: {
    backgroundColor: theme.colors.backgroundPanel,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: -3, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(76,42,159,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeButtonText: {
    color: theme.colors.textLabel,
    fontSize: 14,
  },
  tabContent: {
    marginBottom: 6,
    paddingRight: 26,
  },
  placeName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textTitle,
  },
  placeCategory: {
    fontSize: 10,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingText: {
    flexDirection: 'column',
  },
  ratingLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  ratingCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  hint: {
    fontSize: 10,
    color: '#4a3070',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default LocationsSidebar;
