import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/GradesPage.css";

const GradesPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { assignmentId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [submissions, setSubmissions] = useState([]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Redirect non-teachers
    useEffect(() => {
        if (!user || user.role !== "teacher") {
            navigate("/login");
        }
    }, [user, navigate]);

    // Mock: Fetch submissions
    useEffect(() => {
        const fetchSubmissions = async () => {
            const mockSubmissions = [
                { id: 1, studentName: "Alice Johnson", fileUrl: "/submissions/alice.pdf" },
                { id: 2, studentName: "Bob Smith", fileUrl: "/submissions/bob.pdf" },
            ];
            setSubmissions(mockSubmissions);
        };
        fetchSubmissions();
    }, [assignmentId]);

    return (
        <div className="grades-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">Assignment Submissions</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="grades-content fade-in">
                <h2>Submissions for Assignment #{assignmentId}</h2>

                {submissions.length === 0 ? (
                    <p>No submissions found.</p>
                ) : (
                    <ul className="submission-list">
                        {submissions.map((sub) => (
                            <li key={sub.id} className="submission-item">
                                <p><strong>{sub.studentName}</strong></p>
                                <iframe
                                    src={sub.fileUrl}
                                    width="100%"
                                    height="400px"
                                    title={`Submission by ${sub.studentName}`}
                                />
                                <button
                                    className="btn"
                                    onClick={() =>
                                        navigate(`/submission/${assignmentId}/${sub.id}`, { state: { submission: sub } })
                                    }
                                >
                                    View Details
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default GradesPage;
