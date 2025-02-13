import React, { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the expand icon
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Import the collapse icon
import "./Sidebar.css"; // Import custom CSS for Sidebar

const Sidebar = ({ predefinedRegions, expandedRegion, toggleSubRegions, expandedWilaya, toggleWilayaCommunes, focusOnRegion, isSidebarOpen, toggleSidebar, coordinateType, setCoordinateType, handleWilayaClick }) => {
  const [coordinateSystem, setCoordinateSystem] = useState("WGS84");
  const [dbRegions, setDbRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDbRegionsExpanded, setIsDbRegionsExpanded] = useState(false);
  const [expandedDbWilaya, setExpandedDbWilaya] = useState(null);

  // Add new state for administrative regions
  const [adminRegions, setAdminRegions] = useState([]);
  const [isAdminRegionsExpanded, setIsAdminRegionsExpanded] = useState(false);
  const [expandedAdminRegion, setExpandedAdminRegion] = useState(null);
  const [expandedDaira, setExpandedDaira] = useState(null);
  const [expandedAdminWilaya, setExpandedAdminWilaya] = useState(null);

  // Add new state for administrative entities
  const [wilayas, setWilayas] = useState([]);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [isWilayasExpanded, setIsWilayasExpanded] = useState(false);
  const [isDairasExpanded, setIsDairasExpanded] = useState(false);
  const [isCommunesExpanded, setIsCommunesExpanded] = useState(false);

  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001' 
    : '';

  const fetchRegionsFromDB = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First tries to fetch using the proxy configuration
      let response = await fetch('/api/regions');
      
      // Fallback to direct URL if proxy fails
      if (!response.ok) {
        response = await fetch('http://localhost:5001/api/regions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // Handle errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDbRegions(data); // Store the fetched data
    } catch (err) {
      setError(`Failed to fetch regions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDbRegions = () => {
    if (!dbRegions.length) {
      fetchRegionsFromDB();
    }
    setIsDbRegionsExpanded(!isDbRegionsExpanded);
  };

  const toggleDbWilaya = (wilayaId) => {
    setExpandedDbWilaya(expandedDbWilaya === wilayaId ? null : wilayaId);
  };

  // Add new fetch function for administrative regions
  const fetchAdminRegions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response = await fetch('/api/administrative-regions');
      
      if (!response.ok) {
        response = await fetch('http://localhost:5001/api/administrative-regions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAdminRegions(data);
    } catch (err) {
      setError(`Failed to fetch administrative regions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add toggle functions for administrative regions
  const toggleAdminRegions = () => {
    if (!adminRegions.length) {
      fetchAdminRegions();
    }
    setIsAdminRegionsExpanded(!isAdminRegionsExpanded);
  };

  const toggleAdminRegion = (regionId) => {
    setExpandedAdminRegion(expandedAdminRegion === regionId ? null : regionId);
  };

  const toggleAdminWilaya = (wilayaId) => {
    setExpandedAdminWilaya(expandedAdminWilaya === wilayaId ? null : wilayaId);
  };

  const toggleDaira = (dairaId) => {
    setExpandedDaira(expandedDaira === dairaId ? null : dairaId);
  };

  // Add fetch functions
  const fetchWilayas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/wilayas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Wilayas data:', data);
      setWilayas(data);
    } catch (error) {
      console.error('Error fetching wilayas:', error);
      setError('Failed to fetch wilayas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDairas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dairas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dairas data:', data);
      setDairas(data);
    } catch (error) {
      console.error('Error fetching dairas:', error);
      setError('Failed to fetch dairas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/communes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Communes data:', data);
      setCommunes(data);
    } catch (error) {
      console.error('Error fetching communes:', error);
      setError('Failed to fetch communes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add toggle functions
  const toggleWilayas = () => {
    if (!wilayas.length) fetchWilayas();
    setIsWilayasExpanded(!isWilayasExpanded);
  };

  const toggleDairas = () => {
    if (!dairas.length) fetchDairas();
    setIsDairasExpanded(!isDairasExpanded);
  };

  const toggleCommunes = () => {
    if (!communes.length) fetchCommunes();
    setIsCommunesExpanded(!isCommunesExpanded);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h3>Region Selection</h3>
      </div>

      <div className="sidebar-content">
        {/* Administrative Regions Section */}
        <div className="region-option" onClick={toggleAdminRegions}>
          Administrative Regions
          <span className="dropdown-icon">
            {isAdminRegionsExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </span>
        </div>
        
        {isAdminRegionsExpanded && (
          <div className="sub-region-list">
            {/* Wilayas Section */}
            <div className="admin-option" onClick={toggleWilayas}>
              Wilayas
              <span className="dropdown-icon">
                {isWilayasExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </span>
            </div>
            {isWilayasExpanded && (
              <div className="entity-list">
                {isLoading && <div className="loading-message">Loading wilayas...</div>}
                {error && <div className="error-message">{error}</div>}
                {wilayas.map(wilaya => (
                  <div 
                    key={wilaya.id} 
                    className="entity-item"
                    onClick={() => handleWilayaClick(wilaya.name)}
                  >
                    {wilaya.name}
                  </div>
                ))}
              </div>
            )}

            {/* Dairas Section */}
            <div className="admin-option" onClick={toggleDairas}>
              Dairas
              <span className="dropdown-icon">
                {isDairasExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </span>
            </div>
            {isDairasExpanded && (
              <div className="entity-list">
                {isLoading && <div className="loading-message">Loading dairas...</div>}
                {error && <div className="error-message">{error}</div>}
                {dairas.map(daira => (
                  <div key={daira.id} className="entity-item">
                    {daira.name} ({daira.wilaya_name})
                  </div>
                ))}
              </div>
            )}

            {/* Communes Section */}
            <div className="admin-option" onClick={toggleCommunes}>
              Communes
              <span className="dropdown-icon">
                {isCommunesExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </span>
            </div>
            {isCommunesExpanded && (
              <div className="entity-list">
                {isLoading && <div className="loading-message">Loading communes...</div>}
                {error && <div className="error-message">{error}</div>}
                {communes.map(commune => (
                  <div
                    key={commune.id}
                    className="entity-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      const communeName = commune.name;
                      console.log("Clicking commune in sidebar:", {
                        communeName,
                        coordinates: commune.coordinates,
                        zoom: commune.zoom
                      });
                      handleWilayaClick(communeName);
                      focusOnRegion(commune.coordinates, commune.zoom);
                    }}
                  >
                    {commune.name} ({commune.daira_name})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Database Regions Section */}
        <div className="region-option" onClick={toggleDbRegions}>
          Geographical Zones
          <span className="dropdown-icon">
            {isDbRegionsExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </span>
        </div>
        
        {isDbRegionsExpanded && (
          <div className="sub-region-list">
            {isLoading && <div className="loading-message">Loading regions...</div>}
            {error && <div className="error-message">{error}</div>}
            {dbRegions.map((region) => (
              <div key={region.id}>
                <div className="wilaya-option" onClick={() => toggleDbWilaya(region.id)}>
                  {region.name}
                  <span className="dropdown-icon">
                    {expandedDbWilaya === region.id ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                  </span>
                </div>
                {expandedDbWilaya === region.id && region.wilayas && (
                  <div className="commune-list">
                    {region.wilayas.map((wilaya) => (
                      <div 
                        key={wilaya.id} 
                        className="commune-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWilayaClick(wilaya.name);
                        }}
                      >
                        {wilaya.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Existing Predefined Regions Section */}
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
                    {expandedWilaya === subRegion.name && subRegion.communes && (
                      <div className="commune-list">
                        {subRegion.communes.map((commune, communeIndex) => (
                          <div
                            key={communeIndex}
                            className="commune-option"
                            onClick={(e) => {
                              e.stopPropagation();
                              const communeName = commune.name;
                              console.log("Clicking commune in sidebar:", {
                                communeName,
                                coordinates: commune.coordinates,
                                zoom: commune.zoom
                              });
                              handleWilayaClick(communeName);
                              focusOnRegion(commune.coordinates, commune.zoom);
                            }}
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
        <label htmlFor="coordinateType"></label>
        <select
          id="coordinateType"
          value={coordinateType}
          onChange={(e) => setCoordinateType(e.target.value)}
        >
          <option value="WGS84">WGS84</option>
          <option value="UTM">UTM</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;