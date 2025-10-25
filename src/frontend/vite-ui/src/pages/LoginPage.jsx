import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="login-page">
      {/* Sidebar Toggle Button */}
      <button className="menu-btn" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Centered Login Card */}
      <div className="login-card card fade-in">
        <h1 className="iridescent">Login</h1>

        <a
          href="http://127.0.0.1:8020/api/login" // <-- Flask backend login route
          className="btn"
        >
          Login with Google
        </a>

        <p className="login-footer">
          Don't have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
