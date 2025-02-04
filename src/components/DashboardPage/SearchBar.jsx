import React, { useState, useRef, useEffect } from "react";
import "./SearchBar.css"; // Import custom CSS for SearchBar

const SearchBar = ({ onSearch, searchResults, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchBarRef = useRef(null);

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) { // Start searching after 3 characters
      onSearch(term);
      setIsDropdownVisible(true); // Show dropdown when searching
    } else {
      setIsDropdownVisible(false); // Hide dropdown if search term is too short
    }
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setSearchTerm(""); // Clear the search term
      setIsDropdownVisible(false); // Hide the dropdown
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar" ref={searchBarRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Search for a place..."
      />
      {isDropdownVisible && searchResults.length > 0 && (
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