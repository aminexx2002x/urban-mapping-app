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
      <button onClick={handleSearch} aria-label="Search Button">
        <SearchIcon className="search-icon" />
      </button>
      <input
        type="text"
        placeholder="Search Urban Mapping"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchBar;