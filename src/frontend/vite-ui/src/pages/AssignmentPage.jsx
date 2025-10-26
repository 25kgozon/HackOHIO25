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
    const [studentFile, setStudentFile] = useState(null);
    const [studentPdfUrl, setStudentPdfUrl] = useState(null);

    const handleStudentFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setStudentFile(file);
            setStudentPdfUrl(URL.createObjectURL(file));
        } else alert("Please select a PDF file.");
    };

    const handleStudentUpload = async () => {
        if (!studentFile) return alert("No file selected.");

        try {
            const formData = new FormData();
            formData.append("file", studentFile);

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            console.log("Student PDF uploaded, URL:", data.url);
            alert(`Student PDF uploaded! Check console for URL.`);

            setStudentFile(null);
            setStudentPdfUrl(null);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // ---------- Teacher Upload ----------
    const [teacherFile, setTeacherFile] = useState(null);
    const [teacherPdfUrl, setTeacherPdfUrl] = useState(null);

    const handleTeacherFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setTeacherFile(file);
            setTeacherPdfUrl(URL.createObjectURL(file));
        } else alert("Please select a PDF file.");
    };

    const handleTeacherUpload = async () => {
        if (!teacherFile) return alert("No file selected.");

        try {
            const formData = new FormData();
            formData.append("file", teacherFile);

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            console.log("Answer Key uploaded, URL:", data.url);
            alert(`Answer Key uploaded! Check console for URL.`);

            setTeacherFile(null);
            setTeacherPdfUrl(null);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
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
                            onChange={handleStudentFileChange}
                        />
                        <button className="btn" onClick={() => document.getElementById("studentFileInput").click()}>
                            Select PDF
                        </button>
                        {studentPdfUrl && <iframe src={studentPdfUrl} width="100%" height="600px" title="Student PDF Preview" />}
                        <button className="btn" onClick={handleStudentUpload} disabled={!studentFile}>
                            Upload PDF
                        </button>
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
                                id="teacherFileInput"
                                style={{ display: "none" }}
                                onChange={handleTeacherFileChange}
                            />
                            <button className="btn" onClick={() => document.getElementById("teacherFileInput").click()}>
                                Select PDF
                            </button>
                            <button className="btn" onClick={handleTeacherUpload} disabled={!teacherFile}>
                                Upload Answer Key
                            </button>
                            <button className="btn" onClick={toggleAiInstructions}>
                                {showAiInstructions ? "Close AI Instructions" : "AI Instructions"}
                            </button>
                        </div>

                        {teacherPdfUrl && <iframe src={teacherPdfUrl} width="100%" height="600px" title="Answer Key Preview" />}

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
