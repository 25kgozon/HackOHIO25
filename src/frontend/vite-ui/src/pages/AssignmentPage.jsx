import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Rubric from "../components/Rubric";
import { useUser } from "../context/UserContext";
import "../styles/AssignmentPage.css";

const AssignmentPage = () => {
    const { id, assignmentTitle } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const { courseTitle, assignmentDetails } = location.state || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ---------- Student Upload ----------
    const [selectedFile, setSelectedFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
            setPdfUrl(URL.createObjectURL(file));
        } else alert("Please select a PDF file.");
    };

    const handleUpload = () => {
        if (!selectedFile) return alert("No file selected.");
        alert(`File "${selectedFile.name}" ready to upload!`);
        setSelectedFile(null);
        setPdfUrl(null);
    };

    // ---------- Teacher Upload ----------
    const [answerKeyFile, setAnswerKeyFile] = useState(null);
    const [answerKeyUrl, setAnswerKeyUrl] = useState(null);

    const handleAnswerKeyChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setAnswerKeyFile(file);
            setAnswerKeyUrl(URL.createObjectURL(file));
        } else alert("Please select a PDF file.");
    };

    const handleAnswerKeyUpload = () => {
        if (!answerKeyFile) return alert("No file selected.");
        alert(`Answer key "${answerKeyFile.name}" ready to upload!`);
        setAnswerKeyFile(null);
        setAnswerKeyUrl(null);
    };

    // ---------- AI Instructions ----------
    const [aiInstructions, setAiInstructions] = useState("");
    const [showAiInstructions, setShowAiInstructions] = useState(false);

    const toggleAiInstructions = () => setShowAiInstructions(!showAiInstructions);

    const handleSaveAiInstructions = () => {
        console.log("AI Instructions saved:", aiInstructions);
        alert("AI Instructions saved! Check console.");
        setShowAiInstructions(false);
    };

    // ---------- Sidebar ----------
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="assignment-page">
            {user && (
                <header className="main-header">
                    <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                    <h1 className="title-text">GrAIscope | Assignment Info</h1>
                </header>
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
                        </>
                    ) : (
                        <p>Assignment details not found.</p>
                    )}
                </div>

                {/* ---------- Student Upload ---------- */}
                {!isTeacher && (
                    <div className="upload-section">
                        <h4>Submit Your Assignment:</h4>
                        <input
                            type="file"
                            accept="application/pdf"
                            id="studentFileInput"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <button className="btn" onClick={() => document.getElementById("studentFileInput").click()}>
                            Select PDF
                        </button>
                        {pdfUrl && (
                            <iframe src={pdfUrl} width="100%" height="600px" title="PDF Preview" />
                        )}
                        <button className="btn" onClick={handleUpload} disabled={!selectedFile}>Upload PDF</button>
                    </div>
                )}

                {/* ---------- Teacher Upload ---------- */}
                {isTeacher && (
                    <div className="upload-section">
                        <h4>Teacher Tools:</h4>
                        <div className="teacher-buttons">
                            <input
                                type="file"
                                accept="application/pdf"
                                id="answerKeyInput"
                                style={{ display: "none" }}
                                onChange={handleAnswerKeyChange}
                            />
                            <button className="btn" onClick={() => document.getElementById("answerKeyInput").click()}>
                                Select PDF
                            </button>
                            <button className="btn" onClick={handleAnswerKeyUpload} disabled={!answerKeyFile}>
                                Upload Answer Key
                            </button>
                            <button className="btn" onClick={toggleAiInstructions}>
                                {showAiInstructions ? "Close AI Instructions" : "AI Instructions"}
                            </button>
                        </div>

                        {answerKeyUrl && (
                            <iframe src={answerKeyUrl} width="100%" height="600px" title="Answer Key Preview" />
                        )}

                        {/* Rubric */}
                        <Rubric />

                        {/* AI Instructions Popup */}
                        {showAiInstructions && (
                            <div className="popup-overlay">
                                <div className="popup-box">
                                    <h4>AI Instructions</h4>
                                    <textarea
                                        value={aiInstructions}
                                        onChange={(e) => setAiInstructions(e.target.value)}
                                        rows={8}
                                        placeholder="Enter instructions for AI grading..."
                                    />
                                    <div className="popup-actions">
                                        <button className="btn" onClick={handleSaveAiInstructions}>Save</button>
                                        <button className="btn" onClick={toggleAiInstructions}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button className="btn" onClick={() => navigate(-1)}>← Back to {courseTitle}</button>
            </main>
        </div>
    );
};

export default AssignmentPage;
