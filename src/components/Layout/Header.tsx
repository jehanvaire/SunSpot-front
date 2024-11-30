import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import './styles/Header.scss';

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>⚡ SunSpot</IonTitle>
        <IonButtons slot="end">
          <IonButton>
            <IonIcon icon={settingsOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
