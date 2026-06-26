import MapService from '../services/MapService';
import LocationService from '../services/LocationService';
import { Place } from '../models/Place';

export class NavigationLogic {
  private mapService: typeof MapService;
  private locationService: typeof LocationService;
  private highlightedPlaceIndex: number | null = null;

  constructor() {
    this.mapService = MapService;
    this.locationService = LocationService;
  }

  async flyToPlace(place: Place, zoom: number = 15.5): Promise<void> {
    await this.mapService.flyTo([place.lng, place.lat], zoom);
  }

  async centerOnUserLocation(): Promise<void> {
    const position = this.locationService.getCurrentPosition();
    if (position) {
      await this.mapService.flyTo([position.lng, position.lat], 15);
    }
  }

  highlightPlace(placeIndex: number): void {
    this.highlightedPlaceIndex = placeIndex;
  }

  clearHighlight(): void {
    this.highlightedPlaceIndex = null;
  }

  getHighlightedIndex(): number | null {
    return this.highlightedPlaceIndex;
  }

  async fitBoundsToPlaces(places: Place[], padding: number = 50): Promise<void> {
    if (places.length === 0) {
      return;
    }

    const coordinates = places.map(p => [p.lng, p.lat] as [number, number]);
    await this.mapService.fitBounds(coordinates, padding);
  }

  async zoomToSearchResults(places: Place[]): Promise<void> {
    if (places.length === 1) {
      await this.flyToPlace(places[0]);
    } else if (places.length > 1) {
      await this.fitBoundsToPlaces(places);
    }
  }

  getBoundsForPlaces(
    places: Place[],
  ): { north: number; south: number; east: number; west: number } | null {
    if (places.length === 0) {
      return null;
    }

    let north = -90;
    let south = 90;
    let east = -180;
    let west = 180;

    places.forEach(place => {
      if (place.lat > north) {
        north = place.lat;
      }
      if (place.lat < south) {
        south = place.lat;
      }
      if (place.lng > east) {
        east = place.lng;
      }
      if (place.lng < west) {
        west = place.lng;
      }
    });

    return { north, south, east, west };
  }
}

export default NavigationLogic;