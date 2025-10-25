import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/AssignmentPage.css"; // Make sure to create this CSS

const AssignmentPage = () => {
    const { id, assignmentTitle } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { courseTitle, assignmentDetails } = location.state || {};

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="assignment-page">
            {/* Header */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | Assignment Info</h1>
            </header>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="assignment-content fade-in">
                <h2 className="course-title iridescent">{courseTitle}</h2>
                <h3 className="assignment-title">{assignmentTitle}</h3>

                <div className="assignment-details">
                    {assignmentDetails ? (
                        <>
                            {assignmentDetails.due && (
                                <div className="assignment-card upcoming">
                                    <strong>Due Date:</strong>
                                    <p>{assignmentDetails.due}</p>
                                </div>
                            )}
                            {assignmentDetails.grade && (
                                <div className="assignment-card graded">
                                    <strong>Grade:</strong>
                                    <p>{assignmentDetails.grade}</p>
                                </div>
                            )}
                            {!assignmentDetails.grade && !assignmentDetails.due && (
                                <p>No additional details available for this assignment.</p>
                            )}
                        </>
                    ) : (
                        <p>Assignment details not found.</p>
                    )}
                </div>

                <button className="btn" onClick={() => navigate(-1)}>
                    ← Back to {courseTitle}
                </button>
            </main>
        </div>
    );
};

export default AssignmentPage;
