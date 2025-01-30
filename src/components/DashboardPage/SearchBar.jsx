import React, { useState } from "react";
import "./SearchBar.css"; // Import custom CSS for SearchBar

const SearchBar = ({ onSearch, searchResults, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) { // Start searching after 3 characters
      onSearch(term);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search for a place..."
      />
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((result, index) => (
            <li key={index} onClick={() => onSelectResult(result)}>
              {result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;