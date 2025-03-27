<<<<<<< HEAD
import React, { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

const WilayaLayer = ({ wilayasData, selectedWilaya }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  
  // Default styles
  const defaultStyle = {
    color: "#3388ff",
    weight: 2,
    opacity: 0.6,
    fillOpacity: 0.2,
    fillColor: "#3388ff"
  };
  
  // Style for selected wilaya
  const selectedStyle = {
    color: "#ff7800",
    weight: 3,
    opacity: 0.9,
    fillOpacity: 0.4,
    fillColor: "#ff7800"
  };

  useEffect(() => {
    if (!wilayasData) return;

    // Clear any existing GeoJSON layer
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.clearLayers();
    }

    // Create a new GeoJSON layer
    geoJsonLayerRef.current = L.geoJSON(wilayasData, {
      style: (feature) => {
        if (selectedWilaya && 
            feature.properties.name === selectedWilaya.properties.name) {
          return selectedStyle;
        }
        return defaultStyle;
      },
      onEachFeature: (feature, layer) => {
        // Add popup with wilaya name
        layer.bindPopup(feature.properties.name);
        
        // Add hover effect
        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: 4,
              fillOpacity: 0.7
            });
            layer.bringToFront();
          },
          mouseout: (e) => {
            const layer = e.target;
            if (selectedWilaya && 
                feature.properties.name === selectedWilaya.properties.name) {
              layer.setStyle(selectedStyle);
            } else {
              layer.setStyle(defaultStyle);
            }
          }
        });
      }
    }).addTo(map);

    // Clean up on unmount
    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
      }
    };
  }, [map, wilayasData, selectedWilaya]);

  return null;
};

export default WilayaLayer; 
=======
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
>>>>>>> 1d75242c7f9f10056ae2ec85e289417794df51f0
