import * as React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/Map.scss';

interface CachedPosition {
  longitude: number;
  latitude: number;
  timestamp: number;
}

const MapComponent: React.FC = () => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

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

      map.addControl(geolocate);

      geolocate.on('geolocate', (e: any) => {
        const position: CachedPosition = {
          longitude: e.coords.longitude,
          latitude: e.coords.latitude,
          timestamp: Date.now()
        };
        localStorage.setItem('lastKnownPosition', JSON.stringify(position));
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
    <div 
      ref={mapContainerRef}
      className="map-container"
    />
  );
};

export default MapComponent;
