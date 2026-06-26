export interface UserData {
  id: string;
  name: string | null;
  ratings: Record<number, number>;
  markedPlaces: number[];
  location: {lat: number; lng: number} | null;
}

export class User {
  id: string;
  name: string | null;
  ratings: Record<number, number>;
  markedPlaces: number[];
  location: {lat: number; lng: number} | null;

  constructor(data: UserData) {
    this.id = data.id;
    this.name = data.name;
    this.ratings = data.ratings || {};
    this.markedPlaces = data.markedPlaces || [];
    this.location = data.location || null;
  }

  hasRated(placeId: number): boolean {
    return this.ratings[placeId] !== undefined;
  }

  getRating(placeId: number): number | null {
    return this.ratings[placeId] || null;
  }

  setRating(placeId: number, rating: number): void {
    this.ratings[placeId] = rating;
  }

  isPlaceMarked(placeId: number): boolean {
    return this.markedPlaces.includes(placeId);
  }

  toggleMark(placeId: number): boolean {
    const index = this.markedPlaces.indexOf(placeId);
    if (index > -1) {
      this.markedPlaces.splice(index, 1);
      return false;
    } else {
      this.markedPlaces.push(placeId);
      return true;
    }
  }

  updateLocation(lat: number, lng: number): void {
    this.location = {lat, lng};
  }

  toJSON(): UserData {
    return {
      id: this.id,
      name: this.name,
      ratings: this.ratings,
      markedPlaces: this.markedPlaces,
      location: this.location,
    };
  }

  static fromJSON(data: UserData): User {
    return new User(data);
  }

  static generateId(): string {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  }
}
