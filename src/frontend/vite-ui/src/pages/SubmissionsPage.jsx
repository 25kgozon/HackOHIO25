import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/SubmissionsPage.css";

// Sample submitted assignments data
const submittedAssignments = [
    {
        courseId: 1,
        courseTitle: "Calculus 101",
        submissions: [
            { title: "Homework 1", student: "Alice", submittedOn: "Oct 15", grade: "95%" },
            { title: "Quiz 1", student: "Bob", submittedOn: "Oct 17", grade: "88%" },
        ],
    },
    {
        courseId: 2,
        courseTitle: "Physics 201",
        submissions: [
            { title: "Lab Report 0", student: "Charlie", submittedOn: "Oct 14", grade: "100%" },
            { title: "Homework 1", student: "David", submittedOn: "Oct 16", grade: "92%" },
        ],
    },
    {
        courseId: 3,
        courseTitle: "Computer Science 101",
        submissions: [
            { title: "Project 1", student: "Eve", submittedOn: "Oct 20", grade: "89%" },
        ],
    },
];

const SubmissionsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Submissions");
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

                <div className="submissions-section">
                    {submittedAssignments.map((course) => (
                        <div key={course.courseId} className="course-section">
                            <h3 className="course-title">{course.courseTitle}</h3>
                            <div className="submission-cards">
                                {course.submissions.map((sub, idx) => (
                                    <div key={idx} className="submission-card">
                                        <div>
                                            <strong>{sub.title}</strong> - {sub.student}
                                        </div>
                                        <div>
                                            Submitted: {sub.submittedOn} | Grade: {sub.grade}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SubmissionsPage;
