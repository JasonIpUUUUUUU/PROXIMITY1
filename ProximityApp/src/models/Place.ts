export interface PlaceData {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  googleRating: number;
  googleReviewCount: number;
  communityRatings: number[];
  photoUrls: string[];
  reviews: ReviewData[];
  googlePlaceId: string | null;
}

export interface ReviewData {
  author: string;
  text: string;
  rating: number;
  time: string;
}

export class Place {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  googleRating: number;
  googleReviewCount: number;
  communityRatings: number[];
  photoUrls: string[];
  reviews: ReviewData[];
  googlePlaceId: string | null;
  isMarked: boolean;
  userRating: number | null;
  highlighted: boolean;

  constructor(data: PlaceData) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.lat = data.lat;
    this.lng = data.lng;
    this.description = data.description;
    this.googleRating = data.googleRating;
    this.googleReviewCount = data.googleReviewCount;
    this.communityRatings = data.communityRatings || [];
    this.photoUrls = data.photoUrls || [];
    this.reviews = data.reviews || [];
    this.googlePlaceId = data.googlePlaceId || null;
    this.isMarked = false;
    this.userRating = null;
    this.highlighted = false;
  }

  getAverageRating(): number {
    const community = this.communityRatings || [];
    const sumCommunity = community.reduce((acc, r) => acc + r, 0);
    const google = this.googleRating;

    const communityVoteCount = community.length;
    const googleWeight = Math.max(1, 5 - communityVoteCount * 0.4);
    const totalWeight = communityVoteCount + googleWeight;
    const weightedSum = sumCommunity + google * googleWeight;

    return weightedSum / totalWeight;
  }

  getEffectiveVoteCount(): number {
    const communityCount = (this.communityRatings || []).length;
    const googleContrib = Math.sqrt(this.googleReviewCount || 0) * 0.5;
    return communityCount + googleContrib;
  }

  getColorRating(allPlaces: Place[]): number {
    const avgRating = this.getAverageRating();
    const ratings = allPlaces.map(p => p.getAverageRating());
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const range = maxRating - minRating;

    return range > 0 ? 1 + ((avgRating - minRating) / range) * 4 : 3;
  }

  addCommunityRating(rating: number): void {
    if (!this.communityRatings) {
      this.communityRatings = [];
    }
    this.communityRatings.push(rating);
  }

  toggleMark(): boolean {
    this.isMarked = !this.isMarked;
    return this.isMarked;
  }

  setUserRating(rating: number | null): void {
    this.userRating = rating;
  }

  toGeoJSON(allPlaces: Place[]): any {
    return {
      type: 'Feature',
      id: this.id,
      geometry: {
        type: 'Point',
        coordinates: [this.lng, this.lat],
      },
      properties: {
        name: this.name,
        category: this.category,
        averageRating: this.getAverageRating(),
        effectiveVoteCount: this.getEffectiveVoteCount(),
        colorRating: this.getColorRating(allPlaces),
        description: this.description,
        lat: this.lat,
        lng: this.lng,
        isMarked: this.isMarked,
        highlighted: this.highlighted,
        placeIndex: this.id,
      },
    };
  }
}
