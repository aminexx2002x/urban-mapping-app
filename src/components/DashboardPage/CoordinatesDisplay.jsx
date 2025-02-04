import React from "react";
import "./CoordinatesDisplay.css"; // Import custom CSS for styling

const CoordinatesDisplay = ({ coordinates }) => {
  return (
    <div className="coordinates-display">
      {coordinates ? coordinates : "Coordinates not available"}
    </div>
  );
};

export default CoordinatesDisplay; 