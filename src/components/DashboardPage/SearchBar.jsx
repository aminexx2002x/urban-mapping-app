import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search'; // Import MUI Search Icon
import "./SearchBar.css"; // Import custom CSS for SearchBar

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coordinateSystem, setCoordinateSystem] = useState("WGS84");

  const handleSearch = () => {
    onSearch(searchTerm, coordinateSystem);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search Google Maps"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search"
      />
      <button onClick={handleSearch} aria-label="Search Button">
        <SearchIcon className="search-icon" />
      </button>
    </div>
  );
};

export default SearchBar;