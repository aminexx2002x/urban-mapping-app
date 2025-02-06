import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, LayersControl, ZoomControl, FeatureGroup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios"; // For HTTP requests
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import "./DashboardPage.css";
import Navbar from "../Navbar/Navbar"; // Correct path for Navbar
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
  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default
  const [expandedRegion, setExpandedRegion] = useState(null); // Track which region is expanded
  const [expandedWilaya, setExpandedWilaya] = useState(null); // Track which Wilaya is expanded
  const [isMapReady, setIsMapReady] = useState(false); // Track if the map is ready
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null); // Ref to store the map object
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [coordinateType, setCoordinateType] = useState("WGS84");
  const [currentBoundaryLayer, setCurrentBoundaryLayer] = useState(null);

  // Predefined regions within Algeria
  const predefinedRegions = [
    // {
    //   name: "--Administrative Regions",
    //   coordinates: [28.0339, 1.6596],
    //   zoom: 6,
    //   subRegions: [
    //     {
    //       name: "Wilayas",
    //       coordinates: [36.7528, 3.0588],
    //       zoom: 10,
    //       communes: [
    //         { name: "Algiers", coordinates: [36.7528, 3.0588], zoom: 13 },
    //         { name: "Oran", coordinates: [35.6971, -0.6308], zoom: 13 },
    //         { name: "Tamanrasset", coordinates: [22.785, 5.5228], zoom: 13 },
    //         { name: "Constantine", coordinates: [36.365, 6.6147], zoom: 13 },
    //         // Add more Wilayas as needed
    //       ],
    //     },
    //     {
    //       name: "Dairas",
    //       coordinates: [36.7528, 3.0588],
    //       zoom: 10,
    //       communes: [
    //         // Add Dairas here
    //       ],
    //     },
    //     {
    //       name: "Communes",
    //       coordinates: [36.7528, 3.0588],
    //       zoom: 10,
    //       communes: [
    //         // Add Communes here
    //       ],
    //     },
    //   ],
    // },
    // {
    //   name: "--Geographical Zones",
    //   coordinates: [27.7000, 0.2833],
    //   zoom: 6,
    //   subRegions: [
    //     { name: "Sahara Desert Zones", coordinates: [27.7000, 0.2833], zoom: 6 },
    //     { name: "Mountain Ranges", coordinates: [35.5559, 6.1741], zoom: 6 },
    //     { name: "Plateaus", coordinates: [34.5559, 5.1741], zoom: 6 },
    //     { name: "Coastal Areas", coordinates: [36.7528, 3.0588], zoom: 6 },
    //   ],
    // },
    {
      name: "Environmental and Ecological Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "National Parks", coordinates: [36.7528, 3.0588], zoom: 6 },
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
    },
    {
      name: "Historical and Cultural Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "UNESCO Heritage Sites", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Historical Trade Routes", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Cultural Clusters", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
    {
      name: "Customized and User-Defined Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "Satellite Data Coverage", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Buffer Zones", coordinates: [36.3654, 6.6147], zoom: 6 },
        { name: "Conflict or Disaster Zones", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
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
      map.addLayer(drawnItems);

      // Fetch GeoJSON data (countries, cities, etc.)
      fetchGeoJSONData(map);

      // Disable right-click context menu on the map
      map.getContainer().addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
  }, [drawnItems, isMapReady]);

  // Function to fetch GeoJSON data
  const fetchGeoJSONData = async (map) => {
    const geoJSONUrl =
      "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/countries.geojson"; // Example URL for countries GeoJSON

    try {
      const response = await axios.get(geoJSONUrl);
      const geojsonLayer = L.geoJSON(response.data, {
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<b>${feature.properties.name}</b>`); // Example popup showing country name
        },
      });

      geojsonLayer.addTo(map); // Add GeoJSON data to the map
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
    }
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to focus on a predefined region
  const focusOnRegion = (coordinates, zoom, boundaryData = null) => {
    console.log('focusOnRegion called with:', coordinates, zoom);
    
    if (!mapRef.current) {
      console.error('Map reference is not available');
      return;
    }

    try {
      // Remove previous boundary if it exists
      if (currentBoundaryLayer) {
        mapRef.current.removeLayer(currentBoundaryLayer);
      }

      // Add new boundary if provided
      if (boundaryData) {
        const boundaryLayer = L.geoJSON(boundaryData, {
          style: {
            color: 'white',
            weight: 4,
            opacity: 1,
            fillColor: '#ff7800',
            fillOpacity: 0.2,
            dashArray: '',
            lineCap: 'round',
            lineJoin: 'round'
          }
        }, { onError: handleGeoJSONError }).addTo(mapRef.current);
        
        console.log('Boundary layer added:', boundaryLayer);
        setCurrentBoundaryLayer(boundaryLayer);
      }

      // Fly to location
      mapRef.current.setView(coordinates, zoom, {
        animate: true,
        duration: 1.5
      });
    } catch (error) {
      console.error('Error in focusOnRegion:', error);
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

          {/* Polygon Drawing Tool */}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={(e) => {
                const layer = e.layer;
                drawnItems.addLayer(layer);
              }}
              draw={{
                rectangle: true,
                circle: true,
                polyline: true,
                polygon: true,
                marker: true,
                circlemarker: true,
              }}
              edit={{
                featureGroup: drawnItems,
                remove: true,
              }}
            />
          </FeatureGroup>

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
        />

        <CoordinatesDisplay coordinates={displayCoordinates()} />
      </main>
    </div>
  );
};

export default DashboardPage;