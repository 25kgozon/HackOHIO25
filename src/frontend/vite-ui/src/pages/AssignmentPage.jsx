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

    const handleStudentUpload = async () => {
        if (!selectedFile) return alert("No file selected.");

        try {
            // Step 1: Request new student file record
            const createRes = await fetch("/api/create_student_file", { method: "POST" });
            if (!createRes.ok) throw new Error("Failed to create student file record");
            const { id: fileId } = await createRes.json();

            // Step 2: Upload file
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadRes = await fetch(`/api/upload/${fileId}`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const data = await uploadRes.json();

            console.log("Uploaded student file URL:", data.url);

            // Step 3: Create graded assignment object
            const gradedAssignment = {
                ...assignmentDetails,
                title: assignmentTitle,
                graded: true,
                submittedUrl: data.url,
                clickable: false, // makes it unclickable in CoursePage
            };

            alert("Assignment submitted! Returning to class page...");

            navigate(`/course/${id}`, {
                state: {
                    courseTitle,
                    movedAssignment: gradedAssignment,
                },
            });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // ---------- Teacher Upload ----------
    const [answerKeyFile, setAnswerKeyFile] = useState(null);
    const [answerKeyUrl, setAnswerKeyUrl] = useState(null);
    const [aiInstructions, setAiInstructions] = useState("");
    const [showAiInstructions, setShowAiInstructions] = useState(false);

    const handleAnswerKeyChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setAnswerKeyFile(file);
            setAnswerKeyUrl(URL.createObjectURL(file));
        } else alert("Please select a PDF file.");
    };

    const handleTeacherUpload = async () => {
        if (!answerKeyFile) return alert("No file selected.");

        try {
            const createRes = await fetch("/api/create_teacher_file", { method: "POST" });
            if (!createRes.ok) throw new Error("Failed to create teacher file record");
            const { id: fileId } = await createRes.json();

            const formData = new FormData();
            formData.append("file", answerKeyFile);

            const uploadRes = await fetch(`/api/upload/${fileId}`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const data = await uploadRes.json();

            console.log("Uploaded teacher file URL:", data.url);
            alert("Answer key uploaded successfully!");

            setAnswerKeyFile(null);
            setAnswerKeyUrl(null);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const toggleAiInstructions = () => setShowAiInstructions(!showAiInstructions);
    const handleSaveAiInstructions = () => {
        console.log("AI Instructions saved:", aiInstructions);
        alert("AI Instructions saved!");
        setShowAiInstructions(false);
    };

    return (
        <div className="assignment-page">
            {user && (
                <header className="main-header">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
                    <h1 className="title-text">GrAIscope | Assignment Info</h1>
                </header>
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="assignment-content fade-in">
                <h2 className="course-title iridescent">{courseTitle}</h2>
                <h3 className="assignment-title">{assignmentTitle}</h3>

                {/* Assignment Info */}
                <div className="assignment-details">
                    {assignmentDetails ? (
                        <>
                            <div className="assignment-card upcoming">
                                <strong>Due Date:</strong>
                                <p>{assignmentDetails.due || "N/A"}</p>
                            </div>
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

                {/* Student Upload */}
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
                        {pdfUrl && <iframe src={pdfUrl} width="100%" height="400px" title="PDF Preview" />}
                        <button className="btn" onClick={handleStudentUpload} disabled={!selectedFile}>
                            Upload PDF
                        </button>
                    </div>
                )}

                {/* Teacher Tools */}
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
                            <button className="btn" onClick={handleTeacherUpload} disabled={!answerKeyFile}>
                                Upload Answer Key
                            </button>
                            <button className="btn" onClick={toggleAiInstructions}>
                                {showAiInstructions ? "Close AI Instructions" : "AI Instructions"}
                            </button>
                        </div>
                        {answerKeyUrl && <iframe src={answerKeyUrl} width="100%" height="400px" title="Answer Key Preview" />}
                        <Rubric />
                        {showAiInstructions && (
                            <div className="popup-overlay">
                                <div className="popup-box small-box">
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
