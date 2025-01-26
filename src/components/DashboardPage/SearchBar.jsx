import React, { useState } from "react";
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
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;