import React, { useState, useEffect } from "react";
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
        upcoming: [],
        graded: [],
    });

    const [showModal, setShowModal] = useState(false);
    const [newAssignmentName, setNewAssignmentName] = useState("");
    const [newAssignmentDue, setNewAssignmentDue] = useState("");
    const [newAssignmentFile, setNewAssignmentFile] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // ---------------------------
    // Fetch assignments
    // ---------------------------
    const fetchAssignments = async () => {
        try {
            const res = await fetch("/api/get_class_assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ "class id": id }),
            });

            if (!res.ok) throw new Error("Failed to fetch assignments");

            const data = await res.json();

            const mappedAssignments = data.map((a) => ({
                id: a.id,
                title: a.name,
                description: a.description,
                attrs: a.attrs,
                due: a.attrs?.due || "TBD", // <-- read from attrs
                graded: a.graded || false,
            }));

            setAssignments({
                upcoming: mappedAssignments.filter((a) => !a.graded),
                graded: mappedAssignments.filter((a) => a.graded),
            });
        } catch (err) {
            console.error("Error fetching assignments:", err);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [id]);

    // ---------------------------
    // Create a new assignment
    // ---------------------------
    const createAssignment = async () => {
        if (!newAssignmentName.trim()) return alert("Enter an assignment name!");

        try {
            const res = await fetch("/api/create_assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    class_id: id,
                    "ass name": newAssignmentName,
                    "ass desc": "",
                    "ass attrs": {
                        due: newAssignmentDue || "TBD", // <-- store due date here
                    },
                    "ass grade info": {},
                    context: "",
                }),
            });

            if (!res.ok) throw new Error("Failed to create assignment");

            const data = await res.json();
            console.log("Created assignment:", data);

            // Refresh assignments list
            await fetchAssignments();

            // Reset modal fields
            setNewAssignmentName("");
            setNewAssignmentDue("");
            setNewAssignmentFile(null);
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create assignment");
        }
    };

    // ---------------------------
    // Delete class
    // ---------------------------
    const deleteClass = async () => {
        if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) return;

        try {
            const res = await fetch("/api/delete_class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete class");
            }

            alert("Class deleted successfully!");
            navigate("/courses");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") setNewAssignmentFile(file);
        else alert("Please select a PDF file.");
    };

    return (
        <div className="course-info-page">
            <header className="main-header">
                {user && <button className="menu-btn" onClick={toggleSidebar}>☰</button>}
                <h1 className="title-text">GrAIscope | Course Info</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="course-info-content fade-in">
                <div className="course-header">
                    <h2 className="course-title iridescent">{courseTitle}</h2>
                    {isTeacher && (
                        <div className="course-actions">
                            <button className="btn" onClick={() => setShowModal(true)}>Add Assignment</button>
                            <button className="btn danger" onClick={deleteClass}>Delete Class</button>
                        </div>
                    )}
                </div>

                {/* Upcoming Assignments */}
                <section className="assignments-section">
                    <h3>Upcoming Assignments</h3>
                    <div className="assignment-cards">
                        {assignments.upcoming.map((a) => (
                            <div key={a.id} className="assignment-card upcoming">
                                <div
                                    className="assignment-info"
                                    onClick={() =>
                                        navigate(`/course/${id}/assignment/${a.title}`, {
                                            state: { courseTitle, assignmentDetails: a },
                                        })
                                    }
                                >
                                    <strong>{a.title}</strong>
                                    <p>Due: {a.due}</p>
                                </div>
                                {isTeacher && (
                                    <div className="assignment-actions">
                                        <button className="btn small" onClick={() => alert(`Edit ${a.title}`)}>Edit</button>
                                        <button className="btn small danger" onClick={() => alert(`Delete ${a.title}`)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Graded Assignments */}
                <section className="assignments-section">
                    <h3>Graded Assignments</h3>
                    <div className="assignment-cards">
                        {assignments.graded.map((a) => (
                            <div key={a.id} className="assignment-card graded">
                                <div className="assignment-info">
                                    <strong>{a.title}</strong>
                                    <p>Grade: {a.grade || "TBD"}</p>
                                </div>
                                {isTeacher && (
                                    <div className="assignment-actions">
                                        <button className="btn small" onClick={() => alert(`Edit ${a.title}`)}>Edit</button>
                                        <button className="btn small danger" onClick={() => alert(`Delete ${a.title}`)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Create Assignment Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Create Assignment</h3>
                            <input
                                type="text"
                                placeholder="Assignment Name"
                                value={newAssignmentName}
                                onChange={(e) => setNewAssignmentName(e.target.value)}
                            />
                            <input
                                type="date"
                                placeholder="Due Date"
                                value={newAssignmentDue}
                                onChange={(e) => setNewAssignmentDue(e.target.value)}
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
