import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, LayersControl, ZoomControl, FeatureGroup } from "react-leaflet";
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

// Fix for default icon path issues
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DashboardPage = () => {
  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default
  const [expandedRegion, setExpandedRegion] = useState(null); // Track which region is expanded
  const [expandedWilaya, setExpandedWilaya] = useState(null); // Track which Wilaya is expanded
  const [isMapReady, setIsMapReady] = useState(false); // Track if the map is ready
  const mapRef = useRef(null); // Ref to store the map object

  // Predefined regions within Algeria
  const predefinedRegions = [
    {
      name: "Administrative Regions",
      coordinates: [28.0339, 1.6596],
      zoom: 6,
      subRegions: [
        {
          name: "Wilayas",
          coordinates: [36.7528, 3.0588],
          zoom: 10,
          communes: [
            { name: "Algiers", coordinates: [36.7528, 3.0588], zoom: 13 },
            { name: "Oran", coordinates: [35.6971, -0.6308], zoom: 13 },
            { name: "Tamanrasset", coordinates: [22.785, 5.5228], zoom: 13 },
            { name: "Constantine", coordinates: [36.365, 6.6147], zoom: 13 },
            // Add more Wilayas as needed
          ],
        },
        {
          name: "Dairas",
          coordinates: [36.7528, 3.0588],
          zoom: 10,
          communes: [
            // Add Dairas here
          ],
        },
        {
          name: "Communes",
          coordinates: [36.7528, 3.0588],
          zoom: 10,
          communes: [
            // Add Communes here
          ],
        },
      ],
    },
    {
      name: "Geographical Zones",
      coordinates: [27.7000, 0.2833],
      zoom: 6,
      subRegions: [
        { name: "Sahara Desert Zones", coordinates: [27.7000, 0.2833], zoom: 6 },
        { name: "Mountain Ranges", coordinates: [35.5559, 6.1741], zoom: 6 },
        { name: "Plateaus", coordinates: [34.5559, 5.1741], zoom: 6 },
        { name: "Coastal Areas", coordinates: [36.7528, 3.0588], zoom: 6 },
      ],
    },
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

  useEffect(() => {
    if (mapRef.current && isMapReady) {
      const map = mapRef.current;
      map.addLayer(drawnItems);

      const searchControl = new L.Control.Search({
        layer: drawnItems,
        initial: false,
        zoom: 15,
        marker: false,
      });
      map.addControl(searchControl);

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
  const focusOnRegion = (coordinates, zoom) => {
    if (mapRef.current) {
      console.log("Flying to:", coordinates, "with zoom:", zoom); // Debugging
      mapRef.current.flyTo(coordinates, zoom, {
        animate: true,
        duration: 1.5, // Duration of the fly-to animation in seconds
      }); // Smoothly fly to the region
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

  // Function to toggle Wilaya communes visibility
  const toggleWilayaCommunes = (wilayaName) => {
    if (expandedWilaya === wilayaName) {
      setExpandedWilaya(null); // Collapse if already expanded
    } else {
      setExpandedWilaya(wilayaName); // Expand the clicked Wilaya
    }
  };

  // Function to handle search
  const handleSearch = (searchTerm, coordinateSystem) => {
    console.log(`Searching for ${searchTerm} in ${coordinateSystem} coordinate system`);
    // Implement search functionality here
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-content">
        <div className="header-container">
          <SearchBar onSearch={handleSearch} />
          <img
            src={sidebarButtonIcon}
            alt="Toggle Sidebar"
            className="sidebar-toggle-button"
            onClick={toggleSidebar}
          />
        </div>

        <MapContainer
          className="map-container"
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
        />
      </main>
    </div>
  );
};

export default DashboardPage;