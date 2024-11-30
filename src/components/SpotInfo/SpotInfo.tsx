import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { navigateOutline } from 'ionicons/icons';
import './styles/SpotInfo.scss';

const SpotInfo: React.FC = () => {
  // Données statiques pour le moment
  const nearestSpot = {
    name: 'Parc des Buttes-Chaumont',
    distance: 2.3,
    sunnyScore: 85
  };

  return (
    <div className="spot-info">
      <div className="spot-details">
        <IonText>
          <h2>🌞 Spot ensoleillé le plus proche:</h2>
          <p>{nearestSpot.name} ({nearestSpot.distance} km)</p>
        </IonText>
      </div>
      <IonButton expand="block" className="navigate-button">
        <IonIcon icon={navigateOutline} slot="start" />
        Y ALLER
      </IonButton>
    </div>
  );
};

export default SpotInfo;
