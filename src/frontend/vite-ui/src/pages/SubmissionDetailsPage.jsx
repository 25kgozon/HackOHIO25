import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/SubmissionDetailsPage.css";

const SubmissionDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { submission, courseTitle } = location.state || {};

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="submission-details-page">
            {/* Topbar */}
            <header className="submission-topbar">
                <h2>{submission?.title || "Submission Details"}</h2>
            </header>

            {/* Sidebar */}
            <button className="menu-btn" onClick={toggleSidebar}>☰</button>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Submission Info Card */}
            <div className="card">
                <div className="submission-info">
                    <div><strong>Student:</strong> {submission?.student}</div>
                    <div><strong>Course:</strong> {courseTitle}</div>
                    <div><strong>Submitted On:</strong> {submission?.submittedOn}</div>
                    <div><strong>Grade:</strong> {submission?.grade}</div>
                </div>
            </div>

            {/* Submitted PDF Preview */}
            {submission?.pdfUrl && (
                <div className="card">
                    <h3>Submitted PDF</h3>
                    <iframe
                        className="pdf-preview"
                        src={submission.pdfUrl}
                        title="PDF Preview"
                    />
                </div>
            )}

            {/* Placeholder PDF Viewer for comments / feedback */}
            <div className="card pdf-placeholder">
                <h3>Feedback / Annotations PDF (Placeholder)</h3>
                <iframe
                    className="pdf-preview"
                    src="https://example.com/placeholder.pdf" // Replace with database URL later
                    title="Feedback PDF Placeholder"
                />
            </div>

            {/* AI Feedback */}
            <div className="card ai-feedback">
                <h3>AI Feedback</h3>
                <textarea
                    rows={8}
                    placeholder="AI feedback will appear here..."
                    value={submission?.aiFeedback || ""}
                    readOnly
                />
            </div>

            {/* Back Button */}
            <button className="btn" onClick={() => navigate(-1)}>
                ← Back to Submissions
            </button>
        </div>
    );
};



export default SubmissionDetailsPage;
