import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { useUser } from "../context/UserContext";

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useUser();

  const handleNavigate = (path) => {
    console.log("Navigating to:", path);
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {

      logout();
      location.href = "/api/logout";

    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebarContent">
        {/* Close button */}
        <button className="closeBtn" onClick={onClose}>
          ✕
        </button>

        {/* Menu items */}
        <ul className="sidebarMenu">
          <li onClick={() => handleNavigate("/")}>👤 Login / Profile</li>
          <li onClick={() => handleNavigate("/main-page")}>🏠 Assignments</li>
          <li onClick={() => handleNavigate("/courses")}>📚 Courses</li>
          <li onClick={() => handleNavigate("/submissions")}>📤 Submissions</li>
          <li onClick={() => handleNavigate("/grades")}>📊 Grades</li>
          <li onClick={() => handleNavigate("/settings")}>⚙️ Settings</li>
          <li onClick={handleLogout}>⚙️ Logout</li>
        </ul>

      </div>
    </div>
  );
};

export default Sidebar;

//import React, { useState, useEffect } from "react";
