import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./components/DashboardPage/DashboardPage"; // DashboardPage component
import LoginPage from "./components/LoginPage/LoginPage"; // LoginPage component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for LoginPage */}
        <Route path="/login" element={<LoginPage />} />

        {/* DashboardPage will be rendered at '/' */}
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default App;