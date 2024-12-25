import * as React from 'react';
import {Map} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/Map.scss';

const MapComponent: React.FC = () => {

  return <Map
    initialViewState={{
      longitude: -100,
      latitude: 40,
      zoom: 3.5
    }}
    style={{width: '100%', height: '100%'}}
    className="map-container"
    mapStyle="https://tiles.openfreemap.org/styles/liberty"
  />;
};

export default MapComponent;
