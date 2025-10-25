import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CoursesPage from "../pages/CoursesPage"; // your dashboard
import "../styles/LoginPage.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Function to fetch current logged-in user
  const fetchUser = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8020/api/user", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    }
  };

  // Fetch user on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // Login and logout actions
  const handleLogout = async () => {
    await fetch("http://127.0.0.1:8020/api/logout", { credentials: "include" });
    setUser(null);
  };

  if (!user) {
    // Show login page if not logged in
    return (
      <div className="login-page">
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="login-card card fade-in">
          <h1 className="iridescent">Login</h1>
          <a
            href="http://127.0.0.1:8020/api/login" // backend login route
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
  }

  // Show dashboard if logged in
  return (
    <div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <button className="btn logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <CoursePage user={user} />
    </div>
  );
};

export default App;
