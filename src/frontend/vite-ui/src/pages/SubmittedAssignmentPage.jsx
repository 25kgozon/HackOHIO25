import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/SubmittedAssignmentPage.css";

const SubmittedAssignmentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { submission, courseTitle } = location.state || {};

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!submission) {
        return <p>No submission data found.</p>;
    }

    return (
        <div className="submitted-assignment-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | {submission.title}</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="submitted-content fade-in">
                <h2 className="course-title iridescent">{courseTitle}</h2>
                <div className="submission-summary">
                    <p><strong>Student:</strong> {submission.student}</p>
                    <p><strong>Submitted On:</strong> {submission.submittedOn}</p>
                    <p><strong>Total Grade:</strong> {submission.grade}</p>
                </div>

                <section className="rubric-section">
                    <h3>Rubric & Feedback</h3>
                    {submission.rubricFeedback?.length ? (
                        <div className="rubric-cards">
                            {submission.rubricFeedback.map((item, idx) => (
                                <div key={idx} className="rubric-card">
                                    <strong>{item.question}</strong>
                                    <p><strong>Score:</strong> {item.score}</p>
                                    <p><strong>Comments:</strong> {item.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No rubric feedback available.</p>
                    )}
                </section>

                <button className="btn" onClick={() => navigate(-1)}>
                    ← Back to Submissions
                </button>
            </main>
        </div>
    );
};

export default SubmittedAssignmentPage;
