import React, { useEffect, useState } from 'react';
import { IonToolbar, IonText, IonSpinner, IonIcon, IonRow, IonCol } from '@ionic/react';
import { WeatherData, weatherService } from '../../services/weatherService';
import { water, speedometer, cloud, sunny, moon } from 'ionicons/icons';
import './styles/WeatherBar.scss';

const WeatherBar: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Récupérer la position actuelle
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const weatherData = await weatherService.getWeather(latitude, longitude);
          setWeather(weatherData);
        }, (err) => {
          console.error('Erreur de géolocalisation:', err);
          setError('Impossible d\'obtenir votre position');
        });
      } catch (err) {
        console.error('Erreur lors de la récupération de la météo:', err);
        setError('Erreur lors de la récupération des données météo');
      }
    };

    fetchWeatherData();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <IonToolbar className="weather-bar error">
        <IonText className="weather-info">{error}</IonText>
      </IonToolbar>
    );
  }

  if (!weather) {
    return (
      <IonToolbar className="weather-bar">
        <IonSpinner name="crescent" />
      </IonToolbar>
    );
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <IonToolbar className="weather-bar">
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="temperature">
          {Math.round(weather.temperature)}°C
        </IonCol>
        
        <IonCol className="weather-details">
          <div className="description">{weather.description}</div>
          
          <div className="additional-info">
            <span className="info-item">
              <IonIcon icon={water} /> {weather.humidity}%
            </span>
            <span className="info-item">
              <IonIcon icon={speedometer} /> {weather.windSpeed} km/h
            </span>
            <span className="info-item">
              <IonIcon icon={cloud} /> {weather.clouds}%
            </span>
          </div>
        </IonCol>

        <IonCol size="auto" className="sun-times">
          <div className="sun-item">
            <IonIcon icon={sunny} /> {formatTime(weather.sunrise)}
          </div>
          <div className="sun-item">
            <IonIcon icon={moon} /> {formatTime(weather.sunset)}
          </div>
        </IonCol>
      </IonRow>
    </IonToolbar>
  );
}

export default WeatherBar;
