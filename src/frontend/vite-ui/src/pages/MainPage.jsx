import React, { useState } from "react";
import "../styles/MainPage.css";
import Sidebar from "../components/Sidebar";

const MainPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Dashboard"); // Track current section

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    return (
        <div className="main-page">
            {/* Header */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1 className="title-text"> GrAIscope</h1>
            </header>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            {/* Main Content */}
            <main className="main-content fade-in">
                <h1 className="page-title">{activeSection}</h1>

                {/* Placeholder Sections */}
                {activeSection === "Dashboard" && (
                    <div className="placeholder-section dashboard">
                        <p>📊 View recent grading stats, activity logs, and submissions at a glance.</p>
                    </div>
                )}

                {activeSection === "Courses" && (
                    <div className="placeholder-section courses">
                        <p>📚 Placeholder for your enrolled courses and instructor dashboards.</p>
                    </div>
                )}

                {activeSection === "Assignments" && (
                    <div className="placeholder-section assignments">
                        <p>📝 Placeholder for assignment creation, upload, and grading status.</p>
                    </div>
                )}

                {activeSection === "Submissions" && (
                    <div className="placeholder-section submissions">
                        <p>📤 Placeholder for viewing or uploading student submissions.</p>
                    </div>
                )}

                {activeSection === "Grades" && (
                    <div className="placeholder-section grades">
                        <p>🏅 Placeholder for viewing grades, AI feedback, and performance summaries.</p>
                    </div>
                )}

                {activeSection === "Settings" && (
                    <div className="placeholder-section settings">
                        <p>⚙️ Placeholder for system and account configuration.</p>
                    </div>
                )}

                {activeSection === "Login / Profile" && (
                    <div className="placeholder-section profile">
                        <p>👤 Placeholder for user login, registration, and profile management.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MainPage;
