import React, { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the expand icon
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Import the collapse icon
import "./Sidebar.css"; // Import custom CSS for Sidebar

const Sidebar = ({ predefinedRegions, expandedRegion, toggleSubRegions, expandedWilaya, toggleWilayaCommunes, focusOnRegion, isSidebarOpen, toggleSidebar }) => {
  const [coordinateSystem, setCoordinateSystem] = useState("WGS84");

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h3>Predefined Region Selection</h3>
      </div>
      <div className="sidebar-content">
        {predefinedRegions.map((region, index) => (
          <div key={index}>
            <div
              className="region-option"
              onClick={() => toggleSubRegions(region.name)}
            >
              {region.name}
              <span className="dropdown-icon">
                {expandedRegion === region.name ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </span>
            </div>
            {expandedRegion === region.name && (
              <div className="sub-region-list">
                {region.subRegions.map((subRegion, subIndex) => (
                  <div key={subIndex}>
                    <div
                      className="wilaya-option"
                      onClick={() => {
                        toggleWilayaCommunes(subRegion.name);
                        focusOnRegion(subRegion.coordinates, subRegion.zoom);
                      }}
                    >
                      {subRegion.name}
                      <span className="dropdown-icon">
                        {expandedWilaya === subRegion.name ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                      </span>
                    </div>
                    {expandedWilaya === subRegion.name && (
                      <div className="commune-list">
                        {subRegion.communes.map((commune, communeIndex) => (
                          <div
                            key={communeIndex}
                            className="commune-option"
                            onClick={() => focusOnRegion(commune.coordinates, commune.zoom)}
                          >
                            {commune.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        </button>
        <select
          value={coordinateSystem}
          onChange={(e) => setCoordinateSystem(e.target.value)}
        >
          <option value="WGS84">WGS84</option>
          <option value="UTM">UTM</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;