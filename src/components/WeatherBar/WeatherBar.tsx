import React from 'react';
import { IonToolbar, IonText } from '@ionic/react';
import './styles/WeatherBar.scss';

const WeatherBar: React.FC = () => {
  // Données statiques pour le moment
  const weather = {
    temperature: 22,
    condition: 'Partiellement nuageux',
    icon: '🌤️'
  };

  return (
    <IonToolbar className="weather-bar">
      <IonText className="weather-info">
        {weather.icon} {weather.temperature}°C - {weather.condition}
      </IonText>
    </IonToolbar>
  );
};

export default WeatherBar;
