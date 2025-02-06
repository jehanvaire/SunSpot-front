import * as React from 'react';
import { Map } from '@vis.gl/react-maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/Map.scss';

const MapComponent: React.FC = () => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [2.3522, 48.8566], // Paris
        zoom: 11,
        attributionControl: false // Désactive l'attribution par défaut
      });

      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      });

      map.addControl(geolocate);

      map.on('load', () => {
        geolocate.trigger(); // Déclenche automatiquement la géolocalisation
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
