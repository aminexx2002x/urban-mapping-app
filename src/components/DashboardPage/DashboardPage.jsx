import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, ZoomControl, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import "./DashboardPage.css";

import Navbar from "../Navbar/Navbar";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import CoordinatesDisplay from "./CoordinatesDisplay";
import MapControls from "./components/MapControls";
import DrawingTools from "./components/DrawingTools";
import WilayaLayer from "./components/WilayaLayer";

import { convertToUTM } from "./coordinateUtils";
import sidebarButtonIcon from "../../assets/tools/sidebar_button.svg";

// Fix for Leaflet icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [expandedWilaya, setExpandedWilaya] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [coordinateType, setCoordinateType] = useState("WGS84");
  const [wilayasData, setWilayasData] = useState(null);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const mapRef = useRef(null);
  const editableFG = useRef(new L.FeatureGroup());

  const predefinedRegions = [
    {
      name: "Environmental and Ecological Regions",
      coordinates: [36.7528, 3.0588],
      zoom: 6,
      subRegions: [
        { name: "Coastal Areas", coordinates: [36.7528, 3.0588], zoom: 6 },
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
  ];

  const handleSearch = async (searchTerm) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`);
      setSearchResults(
        response.data.map((result) => ({
          name: result.display_name,
          lat: result.lat,
          lon: result.lon,
        }))
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSelectResult = (result) => {
    if (mapRef.current) {
      const { lat, lon } = result;
      mapRef.current.flyTo([lat, lon], 15, { animate: true, duration: 1.5 });
      const marker = L.marker([lat, lon]).addTo(mapRef.current);
      marker.bindPopup(result.name).openPopup();
    }
  };

  useEffect(() => {
    fetch("/all-wilayas.geojson")
      .then((response) => response.json())
      .then((data) => setWilayasData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  const handleWilayaClick = (wilayaName) => {
    if (wilayasData) {
      const wilaya = wilayasData.features.find(
        (feature) => feature.properties.name.toLowerCase() === wilayaName.toLowerCase()
      );

      if (wilaya) {
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

  const MapEvents = () => {
    useMapEvents({
      mousemove: (event) => setCoordinates(event.latlng),
    });
    return null;
  };

  const displayCoordinates = () => {
    if (coordinateType === "UTM") {
      const utmCoords = convertToUTM(coordinates.lat, coordinates.lng);
      return `${utmCoords.easting}, ${utmCoords.northing} (Zone ${utmCoords.zone})`;
    }
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  };

  const focusOnRegion = (coordinates, zoom, wilayaName) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, zoom);
      if (wilayaName) handleWilayaClick(wilayaName);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-content">
        <div className="header-container">
          <SearchBar 
            onSearch={handleSearch} 
            searchResults={searchResults} 
            onSelectResult={handleSelectResult} 
          />
          <img
            src={sidebarButtonIcon}
            alt="Toggle Sidebar"
            className="sidebar-toggle-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        <MapContainer
          className="map-container"
          center={[28.0339, 1.6596]}
          zoom={6}
          ref={mapRef}
          whenReady={(map) => {
            mapRef.current = map.target;
            setIsMapReady(true);
          }}
          zoomControl={false}
        >
          <MapControls />
          <ZoomControl position="bottomright" />
          <DrawingTools editableFG={editableFG.current} />
          <WilayaLayer wilayasData={wilayasData} selectedWilaya={selectedWilaya} />
          <MapEvents />
        </MapContainer>

        <Sidebar
          predefinedRegions={predefinedRegions}
          expandedRegion={expandedRegion}
          toggleSubRegions={setExpandedRegion}
          expandedWilaya={expandedWilaya}
          toggleWilayaCommunes={setExpandedWilaya}
          focusOnRegion={focusOnRegion}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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