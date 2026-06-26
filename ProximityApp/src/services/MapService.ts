import { Place } from '../models/Place';

// Use any to avoid type import issues
type MapboxGLType = any;

export class MapService {
  private static instance: MapService;
  private mapRef: any = null;
  private cameraRef: any = null;
  private MapboxGL: MapboxGLType | null = null;

  private constructor() {}

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  async getMapboxGL(): Promise<any> {
    if (!this.MapboxGL) {
      this.MapboxGL = await import('@rnmapbox/maps');
    }
    return this.MapboxGL;
  }

  setMapRef(ref: any): void {
    this.mapRef = ref;
  }

  setCameraRef(ref: any): void {
    this.cameraRef = ref;
  }

  async flyTo(coordinates: [number, number], zoom: number = 15.5, duration: number = 800): Promise<void> {
    if (this.cameraRef) {
      this.cameraRef.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: zoom,
        animationDuration: duration,
      });
    }
  }

  async fitBounds(
    coordinates: [number, number][],
    padding: number = 50,
    duration: number = 900
  ): Promise<void> {
    if (this.cameraRef && coordinates.length > 0) {
      const MapboxGL = await this.getMapboxGL();
      const { OfflineRegion } = MapboxGL;
      
      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return bounds.extend(coord);
        },
        new OfflineRegion.LngLatBounds(coordinates[0], coordinates[0])
      );

      this.cameraRef.fitBounds(bounds, padding, duration);
    }
  }

  generateGeoJSON(places: Place[], highlightedIndex: number | null = null): any {
    const features = places.map((place, index) => ({
      type: 'Feature',
      id: index,
      geometry: {
        type: 'Point',
        coordinates: [place.lng, place.lat],
      },
      properties: {
        name: place.name,
        category: place.category,
        averageRating: place.getAverageRating(),
        effectiveVoteCount: place.getEffectiveVoteCount(),
        colorRating: place.getColorRating(places),
        description: place.description,
        lat: place.lat,
        lng: place.lng,
        isMarked: place.isMarked,
        highlighted: index === highlightedIndex,
        placeIndex: index,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async getMap(): Promise<any> {
    return this.mapRef;
  }
}

export default MapService.getInstance();