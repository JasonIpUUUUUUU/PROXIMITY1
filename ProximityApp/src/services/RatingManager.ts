import { Place } from '../models/Place';
import { getRatingColor } from '../utils/helpers';
import DatabaseService from './DatabaseService';

export class RatingManager {
  private static instance: RatingManager;
  private db: typeof DatabaseService;
  private ratingCache: Map<number, number[]> = new Map();
  private userRatings: Map<number, number> = new Map();

  private constructor() {
    this.db = DatabaseService;
  }

  static getInstance(): RatingManager {
    if (!RatingManager.instance) {
      RatingManager.instance = new RatingManager();
    }
    return RatingManager.instance;
  }

  async loadRatings(placeId: number): Promise<number[]> {
    if (this.ratingCache.has(placeId)) {
      return this.ratingCache.get(placeId)!;
    }

    const ratings = await this.db.getPlaceRatings(placeId);
    this.ratingCache.set(placeId, ratings);
    return ratings;
  }

  async getPlaceRating(place: Place): Promise<number> {
    const ratings = await this.loadRatings(place.id);
    place.communityRatings = ratings;
    return place.getAverageRating();
  }

  async submitRating(placeId: number, rating: number, userId: string): Promise<boolean> {
    const success = await this.db.saveRating(placeId, rating, userId);

    if (success) {
      if (this.ratingCache.has(placeId)) {
        const ratings = this.ratingCache.get(placeId)!;
        ratings.push(rating);
      }

      this.userRatings.set(placeId, rating);
    }

    return success;
  }

  async getUserRating(placeId: number): Promise<number | null> {
    if (this.userRatings.has(placeId)) {
      return this.userRatings.get(placeId)!;
    }

    const ratings = await this.db.getUserRatings();
    const rating = ratings[placeId] !== undefined ? ratings[placeId] : null;
    if (rating !== null) {
      this.userRatings.set(placeId, rating);
    }
    return rating;
  }

  calculateColorRating(place: Place, allPlaces: Place[]): number {
    const avgRating = place.getAverageRating();
    const ratings = allPlaces.map(p => p.getAverageRating());
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const range = maxRating - minRating;

    return range > 0 ? 1 + ((avgRating - minRating) / range) * 4 : 3;
  }

  getRatingColor(rating: number): string {
    return getRatingColor(rating);
  }

  getWeightedAverage(place: Place): number {
    const community = place.communityRatings || [];
    const sumCommunity = community.reduce((acc, r) => acc + r, 0);
    const google = place.googleRating;

    const communityVoteCount = community.length;
    const googleWeight = Math.max(1, 5 - communityVoteCount * 0.4);
    const totalWeight = communityVoteCount + googleWeight;
    const weightedSum = sumCommunity + google * googleWeight;

    return weightedSum / totalWeight;
  }

  clearCache(): void {
    this.ratingCache.clear();
  }
}

export default RatingManager.getInstance();