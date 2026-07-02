import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

import DatabaseService from './services/DatabaseService';
import RatingManager from './services/RatingManager';
import LocationService from './services/LocationService';

import NavigationLogic from './logic/NavigationLogic';
import FilterLogic from './logic/FilterLogic';
import ProximityLogic from './logic/ProximityLogic';

// Make sure these imports are correct
import MapView from './components/Map/ProximityMap';
import SearchBar from './components/UI/SearchBar';
import PlaceDetail from './components/UI/PlaceDetail';
import RatingModal from './components/UI/RatingModal';
import WelcomeModal from './components/UI/OnboardingModal';
import LocationsSidebar from './components/Sidebar/LocationsSidebar';

import { Place } from './models/Place';
import { User } from './models/User';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [markedPlaces, setMarkedPlaces] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const [proximityPlace, setProximityPlace] = useState<Place | null>(null);

  const db = DatabaseService;
  const ratingManager = RatingManager;
  const locationService = LocationService;
  const navigationLogic = useMemo(() => new NavigationLogic(), []);
  const filterLogic = useMemo(() => new FilterLogic(), []);
  const proximityLogic = useMemo(() => new ProximityLogic(), []);

  // defines a function which calls when the app starts. useCallback ensures it is only called once. Async allows for time related functions like await to be defined

  const initializeApp = useCallback(async () => {
    try {
      // first waits for the database to be initialized, then gets data
      await db.initialize();
      const loadedPlaces = await db.getAllPlaces();
      const userRatings = await db.getUserRatings();
      loadedPlaces.forEach(place => {
        if (userRatings[place.id] !== undefined) {
          place.setUserRating(userRatings[place.id]);
        }
      });
      const marked = await db.loadMarkedPlaces();
      loadedPlaces.forEach(place => {
        place.isMarked = marked.includes(place.id);
      });
      setPlaces(loadedPlaces);
      setMarkedPlaces(marked);
      
      const hasPermission = await locationService.requestPermissions();
      if (hasPermission) {
        locationService.startTracking();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, locationService]);

  const setupProximityLogic = useCallback(() => {
    proximityLogic.start(places, (placeId) => {
      const place = places.find(p => p.id === placeId);
      if (place && !place.userRating) {
        setProximityPlace(place);
        setIsRatingModalVisible(true);
      }
    });
  }, [places, proximityLogic]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    if (places.length > 0) {
      setupProximityLogic();
    }
    return () => {
      proximityLogic.stop();
      locationService.stopTracking();
    };
  }, [places.length, setupProximityLogic, locationService, proximityLogic]);

  const handlePlaceSelect = (placeIndex: number) => {
    const place = places[placeIndex];
    if (place) {
      setSelectedPlace(place);
      setHighlightedIndex(placeIndex);
      setIsDetailVisible(true);
    }
  };

  const handlePlaceDeselect = () => {
    setSelectedPlace(null);
    setHighlightedIndex(null);
    setIsDetailVisible(false);
  };

  const handleMarkToggle = async (placeId: number) => {
    const place = places.find(p => p.id === placeId);
    if (!place) return;
    const isNowMarked = place.toggleMark();
    let updatedMarked = [...markedPlaces];
    if (isNowMarked) {
      updatedMarked.push(placeId);
    } else {
      updatedMarked = updatedMarked.filter(id => id !== placeId);
    }
    setMarkedPlaces(updatedMarked);
    await db.saveMarkedPlaces(updatedMarked);
    setPlaces([...places]);
  };

  const handleRatingSubmit = async (placeId: number, rating: number) => {
    const userId = await getUserOrCreate();
    const success = await ratingManager.submitRating(placeId, rating, userId);
    if (success) {
      const updatedPlaces = places.map(place => {
        if (place.id === placeId) {
          place.addCommunityRating(rating);
          place.setUserRating(rating);
        }
        return place;
      });
      setPlaces(updatedPlaces);
      proximityLogic.markAsRated(placeId);
    }
    setIsRatingModalVisible(false);
    setProximityPlace(null);
  };

  const getUserOrCreate = async (): Promise<string> => {
    const user = await db.loadUserData();
    if (!user) {
      const userId = User.generateId();
      const newUser = new User({
        id: userId,
        name: null,
        ratings: {},
        markedPlaces: [],
        location: null,
      });
      await db.saveUserData(newUser);
      return userId;
    }
    return user.id;
  };

  const handleSearch = (query: string) => {
    filterLogic.setSearchQuery(query);
    const filtered = filterLogic.applyFilters(places, markedPlaces);
    console.log(`Filtered to ${filtered.length} places`);
    if (filtered.length > 0) {
      navigationLogic.zoomToSearchResults(filtered);
    }
  };

  const handleWelcomeDismiss = () => {
    setIsWelcomeVisible(false);
  };

  if (isLoading) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0d2e" />

      {/* Map View - CORRECT PROPS */}
      <MapView
        places={places}
        onPlaceSelect={handlePlaceSelect}
        highlightedIndex={highlightedIndex}
      />

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Locations Sidebar */}
      <LocationsSidebar
        places={places}
        markedPlaces={markedPlaces}
        onPlaceSelect={handlePlaceSelect}
        onPlaceUnmark={(placeId) => handleMarkToggle(placeId)}
      />

      {/* Place Detail Panel */}
      <PlaceDetail
        place={selectedPlace}
        isVisible={isDetailVisible}
        onClose={handlePlaceDeselect}
        onMarkToggle={handleMarkToggle}
        onRatingSubmit={handleRatingSubmit}
        allPlaces={places}
      />

      {/* Rating Modal */}
      <RatingModal
        isVisible={isRatingModalVisible}
        placeName={proximityPlace?.name || ''}
        onClose={() => {
          setIsRatingModalVisible(false);
          setProximityPlace(null);
        }}
        onSubmit={(rating) => {
          if (proximityPlace) {
            handleRatingSubmit(proximityPlace.id, rating);
          }
        }}
      />

      {/* Welcome Modal - ONLY HAS isVisible and onDismiss */}
      <WelcomeModal
        isVisible={isWelcomeVisible}
        onDismiss={handleWelcomeDismiss}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0d2e',
  },
  loading: {
    flex: 1,
    backgroundColor: '#1a0d2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;