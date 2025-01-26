import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, LayersControl, ZoomControl } from "react-leaflet";
import axios from "axios"; // For HTTP requests
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-search/src/leaflet-search.css"; // Search plugin CSS
import "./DashboardPage.css";
import Navbar from "../Navbar/Navbar"; // Correct path for Navbar
import "leaflet-search"; // Import Leaflet Search plugin

const DashboardPage = () => {
  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default
  const [expandedRegion, setExpandedRegion] = useState(null); // Track which region is expanded
  const [isMapReady, setIsMapReady] = useState(false); // Track if the map is ready
  const mapRef = useRef(null); // Ref to store the map object

  // Predefined regions within Algeria
  const predefinedRegions = [
    {
      name: "Administrative Regions",
      coordinates: [28.0339, 1.6596], // Center of Algeria
      zoom: 6,
      subRegions: [
        { name: "Wilaya of Algiers", coordinates: [36.7528, 3.0588], zoom: 10 },
        { name: "Wilaya of Batna", coordinates: [35.5559, 6.1741], zoom: 10 },
        { name: "Wilaya of Tizi Ouzou", coordinates: [36.7167, 4.05], zoom: 10 },
        { name: "Wilaya of Oran", coordinates: [35.6976, -0.6337], zoom: 10 },
        { name: "Wilaya of Constantine", coordinates: [36.3654, 6.6147], zoom: 10 },
        // Add more Wilayas as needed
      ],
    },
    {
      name: "Geographical Zones",
      coordinates: [27.7000, 0.2833], // Adrar (Sahara Desert)
      zoom: 6,
      subRegions: [
        { name: "Sahara Desert", coordinates: [27.7000, 0.2833], zoom: 6 },
        { name: "Atlas Mountains", coordinates: [36.4621, 2.7387], zoom: 6 },
      ],
    },
    {
      name: "Environmental Regions",
      coordinates: [36.7528, 3.0588], // Algiers (Coastal Areas)
      zoom: 6,
      subRegions: [
        { name: "Coastal Areas", coordinates: [36.7528, 3.0588], zoom: 6 },
        { name: "Highlands", coordinates: [36.3654, 6.6147], zoom: 6 },
      ],
    },
    // Add more regions and sub-regions as needed
  ];

  useEffect(() => {
    if (mapRef.current && isMapReady) {
      const map = mapRef.current;
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });

      map.addControl(drawControl);

      map.on("draw:created", (e) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
      });

      const searchControl = new L.Control.Search({
        layer: drawnItems,
        initial: false,
        zoom: 15,
        marker: false,
      });
      map.addControl(searchControl);

      // Fetch GeoJSON data (countries, cities, etc.)
      fetchGeoJSONData(map);
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
  const focusOnRegion = (coordinates, zoom) => {
    if (mapRef.current) {
      console.log("Flying to:", coordinates, "with zoom:", zoom); // Debugging
      mapRef.current.flyTo(coordinates, zoom); // Smoothly fly to the region
    } else {
      console.error("Map is not initialized!"); // Debugging
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

  return (
    <div>
      <Navbar />
      <main className="dashboard-content">
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
          <div className="sidebar-header">
            <h3>Predefined Region Selection</h3>
          </div>
          <div className="sidebar-content">
            {predefinedRegions.map((region, index) => (
              <div key={index}>
                <div
                  className="region-option"
                  onClick={() => {
                    toggleSubRegions(region.name);
                    focusOnRegion(region.coordinates, region.zoom); // Fly to the main region
                  }}
                >
                  {region.name}
                </div>
                {expandedRegion === region.name && (
                  <div className="sub-region-list">
                    {region.subRegions.map((subRegion, subIndex) => (
                      <div
                        key={subIndex}
                        className="sub-region-option"
                        onClick={() => focusOnRegion(subRegion.coordinates, subRegion.zoom)}
                      >
                        {subRegion.name}
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
          </div>
        </div>

        {/* Map Container */}
        <MapContainer
          center={[28.0339, 1.6596]} // Center of Algeria
          zoom={6} // Zoom level to show all of Algeria
          style={{ flex: 1 }}
          whenCreated={(map) => {
            mapRef.current = map; // Store the map object in the ref
            setIsMapReady(true); // Mark the map as ready
          }}
          zoomControl={false} // Disable default zoom control
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/products/arcgis-online/overview">Esri</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Custom Zoom Control at the Bottom */}
          <ZoomControl position="bottomright" />

          {/* Button to toggle sidebar */}
          <div className="sidebar-toggle-button" onClick={toggleSidebar}>
            <span>{isSidebarOpen ? "◄" : "►"}</span>
          </div>
        </MapContainer>
      </main>
    </div>
  );
};

export default DashboardPage;