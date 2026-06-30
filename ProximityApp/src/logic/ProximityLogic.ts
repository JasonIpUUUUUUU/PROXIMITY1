import LocationService from '../services/LocationService';
import {Place} from '../models/Place';

type ProximityCallback = (placeId: number) => void;

export class ProximityLogic {
  private locationService: typeof LocationService;
  private onProximityTrigger: ProximityCallback | null = null;
  private placeCheckInterval: ReturnType<typeof setInterval> | null = null;
  private isActive: boolean = false;
  private radius: number = 80;
  private duration: number = 5 * 60 * 1000;
  private ratedPlaces: Set<number> = new Set();
  private proximityTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();
  private places: Place[] = [];

  constructor() {
    this.locationService = LocationService;
  }

  start(places: Place[], onTrigger: ProximityCallback): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.places = places;
    this.onProximityTrigger = onTrigger;

    this.locationService.addListener(this.handleLocationUpdate.bind(this));

    this.placeCheckInterval = setInterval(() => {
      this.checkAllPlaces();
    }, 30000);
  }

  stop(): void {
    this.isActive = false;
    this.locationService.removeListener(this.handleLocationUpdate.bind(this));

    if (this.placeCheckInterval) {
      clearInterval(this.placeCheckInterval);
      this.placeCheckInterval = null;
    }

    this.clearAllTimers();
    this.ratedPlaces.clear();
  }

  private handleLocationUpdate(): void {
    this.checkAllPlaces();
  }

  private checkAllPlaces(): void {
    const position = this.locationService.getCurrentPosition();
    if (!position) {
      return;
    }

    const {lat, lng} = position;

    this.places.forEach(place => {
      const distance = this.locationService.calculateDistance(lat, lng, place.lat, place.lng);

      if (distance <= this.radius) {
        this.handlePlaceInRange(place.id);
      } else {
        this.handlePlaceOutOfRange(place.id);
      }
    });
  }

  private handlePlaceInRange(placeId: number): void {
    if (this.ratedPlaces.has(placeId)) {
      return;
    }
    if (this.proximityTimers.has(placeId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.proximityTimers.delete(placeId);
      if (this.onProximityTrigger) {
        this.onProximityTrigger(placeId);
      }
    }, this.duration);

    this.proximityTimers.set(placeId, timer);
  }

  private handlePlaceOutOfRange(placeId: number): void {
    if (this.proximityTimers.has(placeId)) {
      clearTimeout(this.proximityTimers.get(placeId)!);
      this.proximityTimers.delete(placeId);
    }
  }

  private clearAllTimers(): void {
    for (const timer of this.proximityTimers.values()) {
      clearTimeout(timer);
    }
    this.proximityTimers.clear();
  }

  markAsRated(placeId: number): void {
    this.ratedPlaces.add(placeId);
    this.handlePlaceOutOfRange(placeId);
  }

  setRadius(radius: number): void {
    this.radius = radius;
  }

  setDuration(duration: number): void {
    this.duration = duration;
  }

  getProximityStatus(placeId: number): 'rated' | 'waiting' | 'out_of_range' {
    if (this.ratedPlaces.has(placeId)) {
      return 'rated';
    }
    if (this.proximityTimers.has(placeId)) {
      return 'waiting';
    }
    return 'out_of_range';
  }

  isCurrentlyActive(): boolean {
    return this.isActive;
  }
}

export default ProximityLogic;
