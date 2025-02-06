import React, { useEffect, useState } from 'react';
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { sunny, partlySunny, cloudy } from 'ionicons/icons';
import { WeatherData, weatherService } from '../../services/weatherService';
import './Weather.css';

interface WeatherProps {
  latitude: number;
  longitude: number;
}

const Weather: React.FC<WeatherProps> = ({ latitude, longitude }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await weatherService.getWeather(latitude, longitude);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des données météo');
        console.error(err);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  const getWeatherIcon = (iconCode: string) => {
    // Mapping des codes météo OpenWeather vers les icônes Ionic
    if (iconCode.includes('01') || iconCode.includes('02')) return sunny;
    if (iconCode.includes('03') || iconCode.includes('04')) return partlySunny;
    return cloudy;
  };

  if (error) {
    return <IonItem lines="none" className="weather-item error">{error}</IonItem>;
  }

  if (!weather) {
    return <IonItem lines="none" className="weather-item">Chargement...</IonItem>;
  }

  return (
    <IonItem lines="none" className="weather-item">
      <IonIcon
        icon={getWeatherIcon(weather.icon)}
        slot="start"
        className="weather-icon"
      />
      <IonLabel>
        {weather.temperature}°C - {weather.description}
      </IonLabel>
    </IonItem>
  );
};

export default Weather;
