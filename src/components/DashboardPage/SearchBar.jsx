import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search'; // Import MUI Search Icon
import "./SearchBar.css"; // Import custom CSS for SearchBar

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      const results = await onSearch(searchTerm);
      setSearchResults(results);
    }
  };

  const handleSelectResult = (result) => {
    setSearchTerm(result.name);
    setSearchResults([]);
    // Handle result selection logic here
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
      {searchResults.length > 0 && (
        <ul className="search-results-dropdown">
          {searchResults.map((result, index) => (
            <li key={index} onClick={() => handleSelectResult(result)}>
              {result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;