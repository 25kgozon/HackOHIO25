import React, { useState } from "react";
import "../styles/MainPage.css";
import Sidebar from "../components/Sidebar";

const MainPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Dashboard"); // Track which section to show

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    return (
        <div className="main-page">
            {/* Header / Navbar */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1>AI AutoGrader</h1>
            </header>

            {/* Sidebar Component */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            {/* Page Content */}
            <main className="main-content">
                <h1>{activeSection}</h1>
                <div className="placeholder-section">
                    {activeSection === "Dashboard" && <p>📊 Overview of recent grading activity.</p>}
                    {activeSection === "Courses" && <p>📚 List of enrolled courses.</p>}
                    {activeSection === "Assignments" && <p>📝 Assignments ready for grading.</p>}
                    {activeSection === "Submissions" && <p>📤 Uploaded student submissions.</p>}
                    {activeSection === "Grades" && <p>🏅 Recent grading reports and scores.</p>}
                    {activeSection === "Settings" && <p>⚙️ Account and system configuration.</p>}
                    {activeSection === "Login / Profile" && <p>👤 Authentication and user details.</p>}
                </div>
            </main>
        </div>
    );
};

export default MainPage;
