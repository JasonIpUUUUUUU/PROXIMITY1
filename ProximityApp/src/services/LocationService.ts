import { haversineDistance } from '../utils/helpers';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';

type LocationListener = (position: { lat: number; lng: number }) => void;

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentPosition: { lat: number; lng: number } | null = null;
  private listeners: LocationListener[] = [];
  private isTracking: boolean = false;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.watchId = Geolocation.watchPosition(
      this.handlePosition.bind(this),
      this.handleError.bind(this),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
        showLocationDialog: true,
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  private handlePosition(position: any): void {
    const { latitude, longitude } = position.coords;
    this.currentPosition = { lat: latitude, lng: longitude };

    this.listeners.forEach(listener => {
      listener(this.currentPosition!);
    });
  }

  private handleError(error: any): void {
    console.warn('Location error:', error.message);
  }

  addListener(callback: LocationListener): void {
    this.listeners.push(callback);
    if (this.currentPosition) {
      callback(this.currentPosition);
    }
  }

  removeListener(callback: LocationListener): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  getCurrentPosition(): { lat: number; lng: number } | null {
    return this.currentPosition;
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return haversineDistance(lat1, lng1, lat2, lng2);
  }

  // For testing - set fake position
  setFakePosition(lat: number, lng: number): void {
    this.currentPosition = { lat, lng };
    this.listeners.forEach(listener => {
      listener(this.currentPosition!);
    });
  }

  isTrackingActive(): boolean {
    return this.isTracking;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Proximity needs access to your location to show nearby places.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS - use the correct method name
        const result = await Geolocation.requestAuthorization('whenInUse');
        return result === 'granted';
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async getCurrentPositionOnce(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.currentPosition = { lat: latitude, lng: longitude };
          resolve(this.currentPosition);
        },
        (error) => {
          console.warn('Get current position error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }
}

export default LocationService.getInstance();