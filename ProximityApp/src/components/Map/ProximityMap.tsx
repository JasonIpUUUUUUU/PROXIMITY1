import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Place } from '../../models/Place';
import MapService from '../../services/MapService';

// Import Mapbox dynamically to avoid CommonJS/ESM issues
let MapboxGL: any = null;

interface ProximityMapProps {
  places: Place[];
  onPlaceSelect: (placeIndex: number) => void;
  onPlaceHover?: (placeIndex: number | null) => void;
  highlightedIndex?: number | null;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const ProximityMap: React.FC<ProximityMapProps> = ({
  places,
  onPlaceSelect,
  onPlaceHover: _onPlaceHover,
  highlightedIndex = null,
  initialCenter = [-1.5358, 52.2919],
  initialZoom = 13.5,
}) => {
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);
  const mapService = MapService;

  // Load Mapbox dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const module = await import('@rnmapbox/maps');
        MapboxGL = module.default || module;
        setIsMapboxLoaded(true);
      } catch (error) {
        console.error('Failed to load Mapbox:', error);
      }
    };
    loadMapbox();
  }, []);

  useEffect(() => {
    if (isMapboxLoaded) {
      mapService.setMapRef(mapRef.current);
      mapService.setCameraRef(cameraRef.current);
    }
  }, [isMapboxLoaded, mapService]);

  const generateGeoJSON = useCallback(() => {
    return mapService.generateGeoJSON(places, highlightedIndex);
  }, [mapService, places, highlightedIndex]);

  if (!isMapboxLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  const { 
    MapView: MapboxMapView, 
    Camera, 
    ShapeSource, 
    CircleLayer, 
    SymbolLayer, 
    StyleURL 
  } = MapboxGL;

  return (
    <View style={styles.container}>
      <MapboxMapView
        ref={mapRef}
        style={styles.map}
        styleURL={StyleURL.Dark}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={initialZoom}
          centerCoordinate={initialCenter}
        />

        {isMapReady && (
          <ShapeSource
            id="places-source"
            shape={generateGeoJSON()}
            onPress={(event: any) => {
              const feature = event.features[0];
              if (feature) {
                const placeIndex = feature.properties?.placeIndex;
                if (placeIndex !== undefined) {
                  onPlaceSelect(placeIndex);
                }
              }
            }}
          >
            <CircleLayer
              id="place-bubbles"
              style={{
                circleRadius: [
                  'interpolate',
                  ['linear'],
                  ['get', 'effectiveVoteCount'],
                  0, 8,
                  10, 15,
                  25, 25,
                  50, 40,
                ],
                circleColor: [
                  'interpolate',
                  ['linear'],
                  ['get', 'colorRating'],
                  1.0, '#e53935',
                  2.0, '#fb8c00',
                  3.0, '#fdd835',
                  4.0, '#7cb342',
                  5.0, '#2e7d32',
                ],
                circleStrokeWidth: [
                  'case',
                  ['boolean', ['get', 'highlighted'], false], 6,
                  ['boolean', ['get', 'isMarked'], false], 5,
                  2,
                ],
                circleStrokeColor: '#ffffff',
                circleOpacity: [
                  'case',
                  ['boolean', ['get', 'highlighted'], false], 1.0,
                  0.65,
                ],
              }}
            />

            <SymbolLayer
              id="place-labels"
              style={{
                textField: [
                  'number-format',
                  ['get', 'averageRating'],
                  { 'min-fraction-digits': 1, 'max-fraction-digits': 1 },
                ],
                textFont: ['DIN Offc Pro Bold'],
                textSize: [
                  'interpolate',
                  ['linear'],
                  ['get', 'effectiveVoteCount'],
                  0, 9,
                  10, 10,
                  25, 12,
                  50, 14,
                ],
                textColor: '#ffffff',
                textHaloColor: 'rgba(0,0,0,0.25)',
                textHaloWidth: 1,
              }}
            />
          </ShapeSource>
        )}
      </MapboxMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0d2e',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a0d2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#b8a3e8',
    fontSize: 16,
  },
});

export default ProximityMap;