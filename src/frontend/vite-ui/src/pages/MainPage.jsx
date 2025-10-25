import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";
import Sidebar from "../components/Sidebar";

// Sample courses data
const sampleCourses = [
    {
        id: 1,
        title: "Calculus 101",
        upcoming: [
            { title: "Homework 3", due: "Oct 30" },
            { title: "Quiz 2", due: "Nov 2" },
        ],
    },
    {
        id: 2,
        title: "Physics 201",
        upcoming: [
            { title: "Lab Report 1", due: "Oct 29" },
            { title: "Midterm Prep", due: "Nov 5" },
        ],
    },
    {
        id: 3,
        title: "Computer Science 101",
        upcoming: [
            { title: "Project Proposal", due: "Nov 3" },
            { title: "Homework 2", due: "Nov 7" },
        ],
    },
];

const MainPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Dashboard"); // Track section
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    return (
        <div className="main-page">
            {/* Header */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | {activeSection}</h1>
            </header>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            {/* Main Content */}
            <main className="main-content fade-in">
                <h2 className="page-title">{activeSection}</h2>

                {activeSection === "Dashboard" && (
                    <div className="dashboard-section">
                        {sampleCourses.map((course) => (
                            <div key={course.id} className="course-section">
                                <h3 className="course-title">{course.title}</h3>
                                <div className="assignment-cards">
                                    {course.upcoming.map((a, idx) => (
                                        <div
                                            key={idx}
                                            className="assignment-card upcoming"
                                            onClick={() =>
                                                navigate(`/course/${course.id}/assignment/${a.title}`, {
                                                    state: { courseTitle: course.title, assignmentDetails: a },
                                                })
                                            }
                                        >
                                            <strong>{a.title}</strong>
                                            <p>Due: {a.due}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection !== "Upcoming Assignments" && (
                    <div className={`placeholder-section ${activeSection.toLowerCase()}`}>
                        <p>📚 Placeholder content for {activeSection}.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MainPage;
