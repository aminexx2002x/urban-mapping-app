import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css'; // Import the CSS file
import logo from '../../assets/logo/logourbangeoai.svg'; // Correct path for the logo

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true); // Trigger loading animation
      // Simulate login process
      setTimeout(() => {
        navigate('/');
      }, 2000); // Adjust delay based on loading time
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo-container">
          <img src={logo} alt="Urban GeoAI Logo" className="logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-title">Please enter your login information</div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
