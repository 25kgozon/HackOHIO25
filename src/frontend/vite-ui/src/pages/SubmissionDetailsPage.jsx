import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/SubmissionDetailsPage.css";

const SubmissionDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { submission, courseTitle } = location.state || {};

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [score, setScore] = useState(null);
    const [loadingScore, setLoadingScore] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        // Get the assignment ID from the URL (last segment)
        const pathSegments = window.location.pathname.split("/");
        const assignmentId = pathSegments[pathSegments.length - 1];
        console.log("Current submission:", submission);
        console.log("Derived assignment ID from URL:", assignmentId);

        const fetchScore = async () => {
            if (!assignmentId) {
                console.log("No assignment ID found in URL");
                setLoadingScore(false);
                return;
            }

            console.log("Fetching score for assignment:", assignmentId);

            setLoadingScore(true);
            try {
                const res = await fetch(`/api/score/${assignmentId}`, {
                    credentials: "include",
                });
                console.log("Response status:", res.status);
                if (!res.ok) throw new Error("Failed to fetch score");
                const data = await res.json();
                console.log("Fetched score data:", data);
                setScore(data); // store entire response, not just data.score

            } catch (err) {
                console.error("Error fetching score:", err);
                setScore("Error");
            } finally {
                setLoadingScore(false);
            }
        };

        fetchScore();
    }, [submission]);



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
                </div>
            </div>

            {/* Submitted PDF Preview */}
            {submission?.pdfUrl && (
                <div className="card">
                    <h3>Submitted PDF</h3>
                    <iframe
                        className="pdf-preview"
                        src={submission.pdfUrl}
                        title="Submitted PDF"
                    />
                </div>
            )}

            {/* AI Feedback */}
            <div className="card ai-feedback">
                <h3>AI Feedback</h3>
                <textarea
                    rows={20} // increase if needed
                    placeholder="AI feedback will appear here..."
                    value={
                        loadingScore
                            ? "Loading feedback..."
                            : score
                                ? score.map((item, i) => `${item.response}\n\nStudent Copy ID: ${item.student_copy}`).join("\n\n---\n\n")
                                : "Feedback not available"
                    }
                    readOnly
                    style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }} // preserve line breaks
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
