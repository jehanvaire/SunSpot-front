import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Header from '../../components/Layout/Header';
import WeatherBar from '../../components/WeatherBar/WeatherBar';
import Map from '../../components/Map';
import SpotInfo from '../../components/SpotInfo/SpotInfo';
import './styles/Home.scss';

const Home: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <WeatherBar />
      <IonContent>
        <div className="home-container">
          <Map />
          <SpotInfo />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
