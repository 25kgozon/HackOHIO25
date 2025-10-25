import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CourseInfoPage.css";
import { useUser } from "../context/UserContext.jsx";

const CourseInfoPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const courseTitle = location.state?.courseTitle || `Course #${id}`;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [assignments, setAssignments] = useState({
        upcoming: [
            { title: "Homework 1", due: "Oct 28" },
            { title: "Project Proposal", due: "Nov 3" },
        ],
        graded: [
            { title: "Quiz 1", grade: "95%" },
            { title: "Homework 0", grade: "100%" },
        ],
    });

    const [showModal, setShowModal] = useState(false);
    const [newAssignmentName, setNewAssignmentName] = useState("");
    const [newAssignmentDue, setNewAssignmentDue] = useState("");
    const [newAssignmentFile, setNewAssignmentFile] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setNewAssignmentFile(file);
        } else {
            alert("Please select a PDF file.");
        }
    };

    const createAssignment = () => {
        if (!newAssignmentName.trim()) return alert("Enter an assignment name!");
        const newAssignment = { title: newAssignmentName, due: newAssignmentDue };
        setAssignments({
            ...assignments,
            upcoming: [...assignments.upcoming, newAssignment],
        });
        setNewAssignmentName("");
        setNewAssignmentDue("");
        setNewAssignmentFile(null);
        setShowModal(false);
    };

    return (
        <div className="course-info-page">
            <header className="main-header">
                {user && <button className="menu-btn" onClick={toggleSidebar}>☰</button>}
                <h1 className="title-text">GrAIscope | Course Info</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="course-info-content fade-in">
                <h2 className="course-title iridescent">{courseTitle}</h2>

                {isTeacher && (
                    <button className="btn" onClick={() => setShowModal(true)}>
                        Add Assignment
                    </button>
                )}

                <section className="assignments-section">
                    <h3>Upcoming Assignments</h3>
                    <div className="assignment-cards">
                        {assignments.upcoming.map((a, idx) => (
                            <div
                                key={idx}
                                className="assignment-card upcoming"
                                onClick={() =>
                                    navigate(`/course/${id}/assignment/${a.title}`, {
                                        state: { courseTitle, assignmentDetails: a },
                                    })
                                }
                            >
                                <strong>{a.title}</strong>
                                <p>Due: {a.due}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="assignments-section">
                    <h3>Graded Assignments</h3>
                    <div className="assignment-cards">
                        {assignments.graded.map((a, idx) => (
                            <div key={idx} className="assignment-card graded">
                                <strong>{a.title}</strong>
                                <p>Grade: {a.grade}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Create Assignment</h3>
                            <input
                                type="text"
                                placeholder="Assignment Name"
                                value={newAssignmentName}
                                onChange={e => setNewAssignmentName(e.target.value)}
                            />
                            <input
                                type="date"
                                placeholder="Due Date"
                                value={newAssignmentDue}
                                onChange={e => setNewAssignmentDue(e.target.value)}
                            />
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                            {newAssignmentFile && <p>Selected File: {newAssignmentFile.name}</p>}

                            <div className="modal-buttons">
                                <button className="btn" onClick={createAssignment}>Create</button>
                                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseInfoPage;
