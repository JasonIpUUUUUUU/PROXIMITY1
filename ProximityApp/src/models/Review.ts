export interface ReviewData {
  id?: string;
  placeId: number;
  rating: number;
  author: string;
  text: string;
  timestamp: Date;
  userId: string | null;
}

export class Review {
  id: string | undefined;
  placeId: number;
  rating: number;
  author: string;
  text: string;
  timestamp: Date;
  userId: string | null;

  constructor(data: ReviewData) {
    this.id = data.id;
    this.placeId = data.placeId;
    this.rating = data.rating;
    this.author = data.author;
    this.text = data.text;
    this.timestamp = data.timestamp;
    this.userId = data.userId;
  }

  getStars(): number {
    return Math.max(0, Math.min(5, Math.round(this.rating)));
  }

  getRelativeTime(): string {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();

    if (diff < 60000) {
      return 'Just now';
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    }
    return `${Math.floor(diff / 604800000)}w ago`;
  }

  toFirestore(): any {
    return {
      rating: this.rating,
      author: this.author,
      text: this.text,
      timestamp: this.timestamp,
      userId: this.userId,
      placeId: this.placeId,
    };
  }

  static fromFirestore(id: string, data: any): Review {
    return new Review({
      id,
      placeId: data.placeId || 0,
      rating: data.rating || 0,
      author: data.author || 'Anonymous',
      text: data.text || '',
      timestamp: data.timestamp?.toDate() || new Date(),
      userId: data.userId || null,
    });
  }
}
