import React from 'react';
import { GeoJSON } from 'react-leaflet';

const WilayaLayer = ({ wilayasData, selectedWilaya }) => {
  if (!wilayasData) return null;

  return (
    <GeoJSON
      data={wilayasData}
      style={(feature) => ({
        color: feature === selectedWilaya ? '#3388ff' : 'transparent',
        weight: feature === selectedWilaya ? 2 : 0,
        fillOpacity: feature === selectedWilaya ? 0.2 : 0,
        fillColor: feature === selectedWilaya ? '#3388ff' : 'transparent'
      })}
    />
  );
};

export default WilayaLayer;