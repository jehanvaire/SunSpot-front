import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles/Map.scss';

const Map: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Données statiques pour le moment
  const defaultPosition = { lat: 48.8566, lng: 2.3522 }; // Paris
  const sunnySpots = [
    { lat: 48.8820, lng: 2.3822, name: 'Parc des Buttes-Chaumont', sunnyScore: 85 },
    { lat: 48.8417, lng: 2.3275, name: 'Jardin du Luxembourg', sunnyScore: 75 }
  ];

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialisation de la carte
      mapRef.current = L.map(mapContainerRef.current).setView([defaultPosition.lat, defaultPosition.lng], 13);

      // Ajout du layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        crossOrigin: 'anonymous',
        maxZoom: 18,
        minZoom: 3
      }).addTo(mapRef.current);

      // Marqueur pour la position actuelle
      if (mapRef.current) {
        L.marker([defaultPosition.lat, defaultPosition.lng], {
          icon: L.divIcon({
            className: 'current-location-marker',
            html: '',
            iconSize: [25, 25]
          })
        }).addTo(mapRef.current);
      }

      // Marqueurs pour les spots ensoleillés
      sunnySpots.forEach(spot => {
        if (mapRef.current) {
          L.marker([spot.lat, spot.lng], {
            icon: L.divIcon({
              className: 'sunny-spot-marker',
              html: '',
              iconSize: [25, 25]
            })
          })
          .bindPopup(`<b>${spot.name}</b><br>Ensoleillement: ${spot.sunnyScore}%`)
          .addTo(mapRef.current);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className="map-container" />;
};

export default Map;
