import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

const DrawingTools = ({ editableFG }) => {
  return (
    <FeatureGroup>
      <EditControl
        position="topleft"
        draw={{
          rectangle: true,
          circle: true,
          marker: true,
          polyline: true,
          polygon: true,
        }}
        edit={{
          featureGroup: editableFG,
          edit: true,
          remove: true
        }}
      />
    </FeatureGroup>
  );
};

export default DrawingTools;