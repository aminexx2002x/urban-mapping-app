import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet-draw/dist/leaflet.draw.css";

const DrawingTools = ({ editableFG }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Add the FeatureGroup to the map
    map.addLayer(editableFG);

    // Initialize the Leaflet.Draw control
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: {
          shapeOptions: {
            color: '#f357a1',
            weight: 3
          }
        },
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#3388ff'
          }
        },
        circle: {
          shapeOptions: {
            color: '#f357a1'
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3388ff'
          }
        },
        marker: true
      },
      edit: {
        featureGroup: editableFG,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Handle created features
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      editableFG.addLayer(layer);
    });

    // Clean up on unmount
    return () => {
      map.removeControl(drawControl);
      map.removeLayer(editableFG);
    };
  }, [map, editableFG]);

  return null;
};

export default DrawingTools; 