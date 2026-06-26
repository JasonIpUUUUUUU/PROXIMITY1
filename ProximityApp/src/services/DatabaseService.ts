import {db} from '../utils/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Place, PlaceData} from '../models/Place';
import {Review} from '../models/Review';
import {User} from '../models/User';
import {samplePlaces} from '../data/samplePlaces';

export class DatabaseService {
  private static instance: DatabaseService;
  private isFirebaseAvailable = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Test Firestore connection
      await getDoc(doc(db, '_ping', 'test'));
      this.isFirebaseAvailable = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.warn('⚠️ Firebase unavailable, falling back to local storage');
      this.isFirebaseAvailable = false;
    }
  }

  async getAllPlaces(): Promise<Place[]> {
    try {
      if (this.isFirebaseAvailable) {
        const placesRef = collection(db, 'places');
        const q = query(placesRef, orderBy('index'));
        const snapshot = await getDocs(q);

        const places: Place[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          places.push(
            new Place({
              id: data.index,
              name: data.name,
              category: data.category,
              lat: data.lat,
              lng: data.lng,
              description: data.description,
              googleRating: data.googleRating,
              googleReviewCount: data.googleReviewCount,
              communityRatings: data.communityRatings || [],
              photoUrls: data.photoUrls || [],
              reviews: data.reviews || [],
              googlePlaceId: data.googlePlaceId || null,
            }),
          );
        });

        return places;
      }

      return this.getDefaultPlaces();
    } catch (error) {
      console.error('Error loading places:', error);
      return this.getDefaultPlaces();
    }
  }

  async getPlaceRatings(placeId: number): Promise<number[]> {
    try {
      if (!this.isFirebaseAvailable) {
        return [];
      }

      const places = await this.getAllPlaces();
      const place = places.find(p => p.id === placeId);
      if (!place) {
        return [];
      }

      const ratingsRef = collection(db, 'ratings', place.name, 'reviews');
      const snapshot = await getDocs(ratingsRef);

      const ratings: number[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        ratings.push(data.rating);
      });

      return ratings;
    } catch (error) {
      console.error('Error loading ratings:', error);
      return [];
    }
  }

  async saveRating(placeId: number, rating: number, userId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable) {
        return this.saveRatingLocal(placeId, rating);
      }

      const places = await this.getAllPlaces();
      const place = places.find(p => p.id === placeId);
      if (!place) {
        return false;
      }

      const ratingsRef = collection(db, 'ratings', place.name, 'reviews');
      await addDoc(ratingsRef, {
        rating: rating,
        timestamp: Timestamp.now(),
        userId: userId,
        placeIndex: placeId,
      });

      return true;
    } catch (error) {
      console.error('Error saving rating:', error);
      return false;
    }
  }

  async saveRatingLocal(placeId: number, rating: number): Promise<boolean> {
    try {
      const ratings = await this.getUserRatings();
      ratings[placeId] = rating;
      await AsyncStorage.setItem('userRatings', JSON.stringify(ratings));
      return true;
    } catch (error) {
      console.error('Error saving rating locally:', error);
      return false;
    }
  }

  async getUserRatings(): Promise<Record<number, number>> {
    try {
      const data = await AsyncStorage.getItem('userRatings');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading user ratings:', error);
      return {};
    }
  }

  async saveUserData(user: User): Promise<void> {
    await AsyncStorage.setItem('userData', JSON.stringify(user.toJSON()));
  }

  async loadUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        return User.fromJSON(JSON.parse(data));
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  async saveMarkedPlaces(placeIds: number[]): Promise<void> {
    await AsyncStorage.setItem('markedPlaces', JSON.stringify(placeIds));
  }

  async loadMarkedPlaces(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem('markedPlaces');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading marked places:', error);
      return [];
    }
  }

  private getDefaultPlaces(): Place[] {
    return samplePlaces.map((data, index) => new Place({...data, id: index}));
  }
}

export default DatabaseService.getInstance();
