// src/pages/MainPage.js
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Sidebar.css";

const MainPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div>
            {/* Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                style={{
                    position: "fixed",
                    top: 20,
                    left: 20,
                    zIndex: 1100,
                    background: "#ff8c00",
                    border: "none",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                }}
            >
                ☰
            </button>

            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isLoggedIn={true} // change to false to test
            />

            {/* Page Content */}
            <div style={{ padding: "80px 20px" }}>
                <h1>Welcome to the Hackathon Project</h1>
                <p>This is the main page, with the sidebar integrated!</p>
            </div>
        </div>
    );
};

export default MainPage;
