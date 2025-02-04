import React from "react";
import "./CoordinatesDisplay.css"; // Import custom CSS for styling

const CoordinatesDisplay = ({ coordinates }) => {
  return (
    <div className="coordinates-display">
      {coordinates ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : ""}
    </div>
  );
};

export default CoordinatesDisplay; 