import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, LayersControl, ZoomControl, FeatureGroup, useMapEvents, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios"; // For HTTP requests
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import "leaflet-search/src/leaflet-search.css"; // Search plugin CSS
import "./DashboardPage.css";
import Navbar from "../Navbar/Navbar"; // Correct path for Navbar
import "leaflet-search"; // Import Leaflet Search plugin
import Sidebar from "./Sidebar"; // Import Sidebar component
import SearchBar from "./SearchBar"; // Import SearchBar component
import sidebarButtonIcon from "../../assets/tools/sidebar_button.svg"; // Import the SVG icon
import CoordinatesDisplay from "./CoordinatesDisplay";
import { convertToUTM } from "./coordinateUtils"; // Utility function for conversion

// Fix for default icon path issues
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const handleGeoJSONError = (error) => {
  console.error('GeoJSON Error:', error);
  return null;
};

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default
  const [expandedRegion, setExpandedRegion] = useState(null); // Track which region is expanded
  const [expandedWilaya, setExpandedWilaya] = useState(null); // Track which Wilaya is expanded
  const [isMapReady, setIsMapReady] = useState(false); // Track if the map is ready
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null); // Ref to store the map object
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [coordinateType, setCoordinateType] = useState("WGS84");
  const [currentBoundaryLayer, setCurrentBoundaryLayer] = useState(null);
  const [wilayasData, setWilayasData] = useState(null);
  const [selectedWilaya, setSelectedWilaya] = useState(null);

  // Remove the drawItems state and MapDrawTools component
  const [editableFG] = useState(new L.FeatureGroup());

  // Update the predefinedRegions array to include actual wilaya names
  const predefinedRegions = [
    {
      name: "Environmental and Ecological Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { 
          name: "Coastal Areas",
          coordinates: [36.7528, 3.0588],
          zoom: 6,
          communes: [
            { name: "Alger", coordinates: [36.7528, 3.0588], zoom: 10 },
            { name: "Oran", coordinates: [35.6969, -0.6331], zoom: 10 },
            { name: "Annaba", coordinates: [36.9142, 7.7427], zoom: 10 },
            { name: "Bejaia", coordinates: [36.7515, 5.0557], zoom: 10 },
            { name: "Skikda", coordinates: [36.8715, 6.9075], zoom: 10 },
            { name: "Tipaza", coordinates: [36.5892, 2.4483], zoom: 10 }
          ]
        },
        { name: "Wetlands", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Forested Zones", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
    {
      name: "Strategic and Operational Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "Military Zones", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Urban Growth Areas", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Satellite Coverage Zones", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
    {
      name: "Geological and Resource Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "Mining Areas", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Oil and Gas Fields", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Hydrographic Basins", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
    {
      name: "Meteorological and Climate Zones",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "Climatic Zones", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Drought-Prone Areas", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Flood Risk Zones", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    }
  ];

  const handleSearch = async (searchTerm) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`);
      setSearchResults(response.data.map((result) => ({
        name: result.display_name,
        lat: result.lat,
        lon: result.lon,
      })));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSelectResult = (result) => {
    if (mapRef.current) {
      const { lat, lon } = result;
      mapRef.current.flyTo([lat, lon], 15, {
        animate: true,
        duration: 1.5,
      });
      // Add a marker at the selected location
      const marker = L.marker([lat, lon]).addTo(mapRef.current);
      marker.bindPopup(result.name).openPopup();
    }
  };

  useEffect(() => {
    if (mapRef.current && isMapReady) {
      const map = mapRef.current;
      map.addLayer(editableFG);

      map.getContainer().addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      return () => {
        map.removeLayer(editableFG);
      };
    }
  }, [isMapReady, editableFG]);

  // Replace the fetchGeoJSONData function with this:
  const fetchBoundariesFromDB = async () => {
    try {
      // First try with proxy
      let response = await fetch('/api/wilaya-boundaries');
      
      // Fallback to direct URL if proxy fails
      if (!response.ok) {
        response = await fetch('http://localhost:5001/api/wilaya-boundaries', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWilayasData({
        type: "FeatureCollection",
        features: data
      });
    } catch (error) {
      console.error("Error fetching boundaries:", error);
    }
  };

  // Update useEffect to use the new function
  useEffect(() => {
    if (mapRef.current && isMapReady) {
      fetchBoundariesFromDB();
    }
  }, [isMapReady]);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Update the focusOnRegion function to handle wilaya selection
  const focusOnRegion = (coordinates, zoom, wilayaName) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, zoom);
      
      // If a wilaya name is provided, trigger the selection
      if (wilayaName) {
        handleWilayaClick(wilayaName);
      }
    }
  };

  // Function to toggle sub-regions visibility
  const toggleSubRegions = (regionName) => {
    if (expandedRegion === regionName) {
      setExpandedRegion(null); // Collapse if already expanded
    } else {
      setExpandedRegion(regionName); // Expand the clicked region
    }
  };

  // Function to toggle Wilaya communes visibility
  const toggleWilayaCommunes = (wilayaName) => {
    if (expandedWilaya === wilayaName) {
      setExpandedWilaya(null); // Collapse if already expanded
    } else {
      setExpandedWilaya(wilayaName); // Expand the clicked Wilaya
    }
  };

  const MapEvents = () => {
    useMapEvents({
      mousemove: (event) => {
        const { lat, lng } = event.latlng;
        setCoordinates({ lat, lng });
      },
    });
    return null;
  };

  const displayCoordinates = () => {
    if (!coordinates) return "";
    if (coordinateType === "UTM") {
      const utmCoords = convertToUTM(coordinates.lat, coordinates.lng);
      return `${utmCoords.easting}, ${utmCoords.northing} (Zone ${utmCoords.zone})`;
    }
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  };

  const handleWilayaClick = (wilayaName) => {
    console.log("Clicking wilaya:", wilayaName);
    console.log("WilayasData loaded?", !!wilayasData);
    
    if (wilayasData) {
      const wilayaNames = wilayasData.features.map(f => f.properties.name);
      console.log("All wilaya names:", wilayaNames);
      
      const wilaya = wilayasData.features.find(
        feature => {
          console.log("Comparing:", {
            clicked: wilayaName.toLowerCase(),
            current: feature.properties.name.toLowerCase()
          });
          return feature.properties.name.toLowerCase() === wilayaName.toLowerCase();
        }
      );
      
      if (wilaya) {
        console.log("Found wilaya:", wilaya);
        setSelectedWilaya(selectedWilaya === wilaya ? null : wilaya);
        
        try {
          const geoJsonLayer = L.geoJSON(wilaya);
          const bounds = geoJsonLayer.getBounds();
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds);
          }
        } catch (error) {
          console.error("Error processing wilaya geometry:", error);
        }
      } else {
        console.error("Wilaya not found:", wilayaName);
      }
    } else {
      console.error("GeoJSON data not loaded yet");
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-content">
        <div className="header-container">
          <SearchBar onSearch={handleSearch} searchResults={searchResults} onSelectResult={handleSelectResult} />
          <img
            src={sidebarButtonIcon}
            alt="Toggle Sidebar"
            className="sidebar-toggle-button"
            onClick={toggleSidebar}
          />
        </div>

        <MapContainer
          className="map-container"
          center={[28.0339, 1.6596]}
          zoom={6}
          ref={mapRef}
          whenReady={(map) => {
            console.log('Map is ready');
            mapRef.current = map.target;
            setIsMapReady(true);
          }}
          zoomControl={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Google Satellite">
              <TileLayer
                url="http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Google Hybrid">
              <TileLayer
                url="http://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="ESRI Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com">ESRI</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Custom Zoom Control at the Bottom */}
          <ZoomControl position="bottomright" />

          {/* Drawing Tools */}
          <FeatureGroup>
            <EditControl
              position="topleft"
              onMounted={(drawControl) => {
                // Optionally store the draw control if needed
                console.log('Draw control mounted:', drawControl);
              }}
              draw={{
                rectangle: true,
                circle: true,
                marker: true,
                polyline: true,
                polygon: true,
                circlemarker: false, // Usually not needed
              }}
              edit={{
                featureGroup: editableFG,
                edit: true,
                remove: true
              }}
            />
          </FeatureGroup>

          {/* Wilaya Selection */}
          {wilayasData && (
            <GeoJSON
              data={wilayasData}
              style={(feature) => ({
                color: feature === selectedWilaya ? '#3388ff' : 'transparent',
                weight: feature === selectedWilaya ? 2 : 0,
                fillOpacity: feature === selectedWilaya ? 0.2 : 0,
                fillColor: feature === selectedWilaya ? '#3388ff' : 'transparent'
              })}
            />
          )}

          <MapEvents />
        </MapContainer>

        <Sidebar
          predefinedRegions={predefinedRegions}
          expandedRegion={expandedRegion}
          toggleSubRegions={toggleSubRegions}
          expandedWilaya={expandedWilaya}
          toggleWilayaCommunes={toggleWilayaCommunes}
          focusOnRegion={focusOnRegion}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMapReady={isMapReady}
          coordinateType={coordinateType}
          setCoordinateType={setCoordinateType}
          handleWilayaClick={handleWilayaClick}
        />

        <CoordinatesDisplay coordinates={displayCoordinates()} />
      </main>
    </div>
  );
};

export default DashboardPage;