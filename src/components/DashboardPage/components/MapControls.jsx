import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';

const MapControls = () => {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="ESRI World Imagery">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
      
      <LayersControl.BaseLayer name="Google Satellite">
        <TileLayer
          url="http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="Google Hybrid">
        <TileLayer
          url="http://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="ESRI Topographic">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          maxZoom={19}
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="Street Map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
};

export default MapControls;