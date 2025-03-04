import * as React from 'react';
import maplibregl from 'maplibre-gl';
import { weatherService, WeatherData } from '../../services/weatherService';
import { getWeatherEmoji } from '../../utils/weatherEmoji';
import './styles/WeatherMarker.scss';

interface WeatherMarkerProps {
  map: maplibregl.Map;
  latitude: number;
  longitude: number;
  cityName?: string; // Optional city name from the parent component
  isPrimary?: boolean; // Whether this is the primary (nearest) city marker
}

const WeatherMarker: React.FC<WeatherMarkerProps> = ({ 
  map, 
  latitude, 
  longitude, 
  cityName,
  isPrimary = true // Default to primary marker
}) => {
  const markerRef = React.useRef<maplibregl.Marker | null>(null);
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const weatherData = await weatherService.getWeather(latitude, longitude);
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données météo');
        console.error(`Weather data fetch error for ${cityName || 'unknown city'}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, cityName, isPrimary]);

  React.useEffect(() => {
    if (!map || !weather) return;


    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create marker element
    const markerElement = document.createElement('div');
    
    // Add weather-specific classes for animations
    let weatherClass = '';
    const weatherId = weather.weatherId || 800; // Default to 800 (clear sky) if not available
    
    if (weatherId >= 200 && weatherId < 600) {
      weatherClass = 'rain';
    } else if (weatherId === 800) {
      weatherClass = 'sun';
    } else if (weatherId >= 600 && weatherId < 700) {
      weatherClass = 'snow';
    }
    
    // Add primary/secondary class for different styling
    const primaryClass = isPrimary ? 'primary' : 'secondary';
    markerElement.className = `weather-marker ${weatherClass} ${primaryClass}`;
    
    // Get weather emoji based on the weather condition from id stored in the API response
    const emoji = getWeatherEmoji(weatherId);
    
    // Create the emoji element with data attribute for temperature hover effect
    const emojiEl = document.createElement('div');
    emojiEl.className = 'weather-emoji';
    emojiEl.innerHTML = emoji;
    emojiEl.setAttribute('data-temp', `${weather.temperature}°C - ${weather.description} (${cityName || weather.city})`);
    markerElement.appendChild(emojiEl);
    
    // Add tooltip with weather info - use the provided cityName if available, otherwise fallback to the one from weather data
    const displayCity = cityName || weather.city;
    markerElement.title = `${displayCity}: ${weather.temperature}°C - ${weather.description}`;
    
    // Create and add the marker to the map with a vertical offset to move it below the city name
    const marker = new maplibregl.Marker({ 
      element: markerElement,
      // Add an offset to move the marker down by 30 pixels
      offset: [0, 30]
    })
      .setLngLat([longitude, latitude])
      .addTo(map);
    
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, weather, latitude, longitude]);

  return null; // This component doesn't render any visible React elements
};

export default WeatherMarker;
