import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Redirect logged-in users to Profile
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleLogin = (role) => {
    // Redirect to backend login endpoint
    location.href = "/api/login?role=" + role;
  };

  return (
    <div className="login-page">
      {/* Show menu only if user exists */}
      {user && (
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="login-card fade-in">
        <h1 className="iridescent">Login</h1>

        {!user && (
          <div className="login-buttons">
            <button className="btn" onClick={() => handleLogin("teacher")}>
              Login as Teacher
            </button>
            <button className="btn" onClick={() => handleLogin("student")}>
              Login as Student
            </button>
          </div>
        )}

        {user && (
          <p className="login-footer">
            Logged in as <strong>{user.role}</strong>. Redirecting...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
