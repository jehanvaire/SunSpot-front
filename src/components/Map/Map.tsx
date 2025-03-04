import * as React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/Map.scss';
import WeatherMarker from '../Weather/WeatherMarker';
import { geocodingService, LocationData } from '../../services/geocodingService';
import { weatherService } from '../../services/weatherService';

interface CachedPosition {
  longitude: number;
  latitude: number;
  timestamp: number;
}

const MapComponent: React.FC = () => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const [currentPosition, setCurrentPosition] = React.useState<{latitude: number, longitude: number} | null>(null);
  const [nearestCity, setNearestCity] = React.useState<LocationData | null>(null);
  const [nearbyCities, setNearbyCities] = React.useState<LocationData[]>([]);
  const [isLoadingCity, setIsLoadingCity] = React.useState<boolean>(false);
  const [isLoadingNearbyCities, setIsLoadingNearbyCities] = React.useState<boolean>(false);
  
  // Read maxCities from environment variable with fallback to 10
  const maxCities = parseInt(import.meta.env.VITE_MAX_NEARBY_CITIES) || 10;

  const getLastKnownPosition = (): CachedPosition | null => {
    const cached = localStorage.getItem('lastKnownPosition');
    if (cached) {
      const position = JSON.parse(cached) as CachedPosition;
      // Vérifie si la position n'est pas trop vieille (24h)
      if (Date.now() - position.timestamp < 24 * 60 * 60 * 1000) {
        return position;
      }
    }
    return null;
  };

  // Get the nearest city and nearby cities when position changes
  React.useEffect(() => {
    if (!currentPosition) return;

    const fetchCities = async () => {
      try {
        setIsLoadingCity(true);
        setIsLoadingNearbyCities(true);
        
        // Get the nearest city first (fastest to display)
        const cityData = await geocodingService.getNearestCity(
          currentPosition.latitude,
          currentPosition.longitude
        );
        setNearestCity(cityData);
        
        // Then get nearby cities (takes longer)
        try {
          const cities = await geocodingService.getNearbyCities(
            currentPosition.latitude,
            currentPosition.longitude,
            maxCities
          );
          
          
          // Filter out the nearest city since it's already displayed separately
          const otherCities = cities.filter(city => city.city !== cityData.city);
          
          setNearbyCities(otherCities);
        } catch (error) {
          console.error('Error fetching nearby cities:', error);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCity(false);
        setIsLoadingNearbyCities(false);
      }
    };

    fetchCities();
  }, [currentPosition, maxCities]);

  React.useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const lastPosition = getLastKnownPosition();
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: lastPosition ? [lastPosition.longitude, lastPosition.latitude] : [2.3522, 48.8566],
        zoom: 11,
        attributionControl: false // Désactive l'attribution par défaut
      });

      const hasLastPosition = getLastKnownPosition() !== null;
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
        fitBoundsOptions: hasLastPosition ? {
          duration: 0,
          maxZoom: map.getZoom()
        } : undefined
      });

      // Ajoute le contrôle de navigation (boussole + zoom)
      const navigationControl = new maplibregl.NavigationControl();
      map.addControl(navigationControl, 'top-left');

      // Ajoute le contrôle de géolocalisation
      map.addControl(geolocate, 'top-right');

      geolocate.on('geolocate', (e: any) => {
        const position: CachedPosition = {
          longitude: e.coords.longitude,
          latitude: e.coords.latitude,
          timestamp: Date.now()
        };
        localStorage.setItem('lastKnownPosition', JSON.stringify(position));
        
        // Update current position state
        setCurrentPosition({
          latitude: e.coords.latitude,
          longitude: e.coords.longitude
        });
      });

      map.on('load', () => {
        // Active toujours la géolocalisation
        geolocate.trigger();
        // Force un recalcul de la taille de la carte
        map.resize();
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Force un recalcul de la taille quand le composant est monté
  React.useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', resizeMap);
    return () => window.removeEventListener('resize', resizeMap);
  }, []);

  return (
    <>
      <div 
        ref={mapContainerRef}
        className="map-container"
      />
      {/* Display the nearest city marker */}
      {mapRef.current && nearestCity && (
        <WeatherMarker 
          map={mapRef.current} 
          latitude={nearestCity.latitude}
          longitude={nearestCity.longitude}
          cityName={nearestCity.city}
          isPrimary={true} // Mark as primary city
        />
      )}
      
      {/* Display markers for all nearby cities */}
      {mapRef.current && nearbyCities.length > 0 && (
        nearbyCities.map((city, index) => (
          <WeatherMarker
            key={`${city.city}-${index}`}
            map={mapRef.current!}
            latitude={city.latitude}
            longitude={city.longitude}
            cityName={city.city}
            isPrimary={false} // Not a primary city
          />
        ))
      )}
    </>
  );
};

export default MapComponent;
