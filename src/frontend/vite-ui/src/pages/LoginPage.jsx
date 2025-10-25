import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogin = (role) => {
    location.href = "/api/login?role=" + role;
  };

  return (
    <div className="login-page">
      {/* Only show menu if user exists */}
      {user && (
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="login-card card fade-in">
        <h1 className="iridescent">Login</h1>

        {!user ? (
          <div className="login-buttons">
            <button className="btn" onClick={() => handleLogin("teacher")}>
              Login as Teacher
            </button>
            <button className="btn" onClick={() => handleLogin("student")}>
              Login as Student
            </button>
          </div>
        ) : (
          <p className="login-footer">
            Logged in as <strong>{user.role}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
