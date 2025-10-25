import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    console.log("Navigating to:", path);
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      // ✅ Call Flask backend logout endpoint
      await fetch("http://127.0.0.1:8020/api/logout", {
        method: "GET",
        credentials: "include", // important: allows cookies/session to clear
      });

      // ✅ Clear any local auth data
      localStorage.removeItem("token");

      // ✅ Optionally update any global login state if you have it
      onClose();

      // ✅ Redirect user to login page
      navigate("/login");
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
        </ul>

      </div>
    </div>
  );
};

export default Sidebar;

//import React, { useState, useEffect } from "react";