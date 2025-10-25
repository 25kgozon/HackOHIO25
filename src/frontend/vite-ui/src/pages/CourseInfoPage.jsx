import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CourseInfoPage.css";

const sampleAssignments = {
    upcoming: [
        { title: "Homework 1", due: "Oct 28" },
        { title: "Project Proposal", due: "Nov 3" },
    ],
    graded: [
        { title: "Quiz 1", grade: "95%" },
        { title: "Homework 0", grade: "100%" },
    ],
};

const CourseInfoPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const courseTitle = location.state?.courseTitle || `Course #${id}`;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="course-info-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="course-info-content fade-in">
                <h2 className="course-title iridescent">{courseTitle}</h2>

                <section className="assignments-section">
                    <h3>Upcoming Assignments</h3>
                    <div className="assignment-cards">
                        {sampleAssignments.upcoming.map((a, idx) => (
                            <div key={idx} className="assignment-card upcoming">
                                <strong>{a.title}</strong>
                                <p>Due: {a.due}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="assignments-section">
                    <h3>Graded Assignments</h3>
                    <div className="assignment-cards">
                        {sampleAssignments.graded.map((a, idx) => (
                            <div key={idx} className="assignment-card graded">
                                <strong>{a.title}</strong>
                                <p>Grade: {a.grade}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CourseInfoPage;
