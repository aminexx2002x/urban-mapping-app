import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file for Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img 
            src={require("../../assets/logo/logonavbar.svg").default} 
            alt="GeoAI Logo" 
            className="navbar-logo"
          />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/login">Logout</Link>
      </div>
    </nav>
  );
};

export default Navbar;
