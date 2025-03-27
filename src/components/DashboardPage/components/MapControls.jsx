<<<<<<< HEAD
import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapControls = () => {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;

    // Add scale control
    const scaleControl = L.control.scale({
      imperial: false,
      position: 'bottomleft'
    }).addTo(map);

    // Add layer control with basemaps
    const baseMaps = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map),
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      })
    };

    const layerControl = L.control.layers(baseMaps, {}, {
      position: 'topright',
      collapsed: false
    }).addTo(map);

    // Add fullscreen control
    // Note: This would typically require a plugin like Leaflet.fullscreen
    // For this example, we'll just show how it would be added
    /* 
    const fullscreenControl = L.control.fullscreen({
      position: 'topleft',
      title: 'Fullscreen Mode',
      titleCancel: 'Exit Fullscreen Mode'
    }).addTo(map);
    */

    // Clean up on unmount
    return () => {
      map.removeControl(scaleControl);
      map.removeControl(layerControl);
      // map.removeControl(fullscreenControl);
    };
  }, [map]);

  return null;
};

export default MapControls; 
=======
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
>>>>>>> 1d75242c7f9f10056ae2ec85e289417794df51f0
