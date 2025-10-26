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

    const [assignments, setAssignments] = useState({ upcoming: [], graded: [] });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState(null);

    const [newAssignmentName, setNewAssignmentName] = useState("");
    const [newAssignmentDue, setNewAssignmentDue] = useState("");
    const [newAssignmentFile, setNewAssignmentFile] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const deleteCourse = async () => {
        if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;

        try {
            const res = await fetch("/api/delete_class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Failed to delete course");
            await res.json();
            alert("Course deleted successfully!");
            navigate("/"); // Go back to dashboard/main page
        } catch (err) {
            console.error(err);
            alert("Failed to delete course");
        }
    };


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
                due: a.attrs?.due || "TBD",
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
    // Create assignment
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
                    "ass attrs": { due: newAssignmentDue || "TBD" },
                    "ass grade info": {},
                    context: "",
                }),
            });
            if (!res.ok) throw new Error("Failed to create assignment");
            await res.json();
            fetchAssignments();
            setNewAssignmentName("");
            setNewAssignmentDue("");
            setNewAssignmentFile(null);
            setShowCreateModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create assignment");
        }
    };

    // ---------------------------
    // Delete assignment
    // ---------------------------
    const deleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;
        try {
            const res = await fetch("/api/delete_assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ "class id": id, "assignment id": assignmentId }),
            });
            if (!res.ok) throw new Error("Failed to delete assignment");
            await res.json();
            fetchAssignments();
        } catch (err) {
            console.error(err);
            alert("Failed to delete assignment");
        }
    };

    // ---------------------------
    // Open edit modal
    // ---------------------------
    const openEditModal = (assignment) => {
        setEditAssignment(assignment);
        setNewAssignmentName(assignment.title);
        setNewAssignmentDue(assignment.due !== "TBD" ? assignment.due : "");
        setShowEditModal(true);
    };

    // ---------------------------
    // Update assignment
    // ---------------------------
    const updateAssignment = async () => {
        if (!editAssignment) return;
        try {
            const res = await fetch("/api/update_assignment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    "assignment id": editAssignment.id,
                    name: newAssignmentName,
                    attrs: { ...editAssignment.attrs, due: newAssignmentDue || "TBD" },
                }),
            });
            if (!res.ok) throw new Error("Failed to update assignment");
            await res.json();
            fetchAssignments();
            setShowEditModal(false);
            setEditAssignment(null);
            setNewAssignmentName("");
            setNewAssignmentDue("");
        } catch (err) {
            console.error(err);
            alert("Failed to update assignment");
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
                            <button className="btn" onClick={() => setShowCreateModal(true)}>Add Assignment</button>
                            <button className="btn danger" onClick={deleteCourse}>Delete Course</button>
                        </div>
                    )}

                </div>

                {/* Assignments */}
                {["upcoming", "graded"].map((type) => (
                    <section key={type} className="assignments-section">
                        <h3>{type === "upcoming" ? "Upcoming Assignments" : "Graded Assignments"}</h3>
                        <div className="assignment-cards">
                            {assignments[type].map((a) => (
                                <div key={a.id} className={`assignment-card ${type}`}>
                                    <div className="assignment-info" onClick={() => navigate(`/course/${id}/assignment/${a.id}`, { state: { courseTitle, assignmentDetails: a } })}>
                                        <strong>{a.title}</strong>
                                        <p>{type === "upcoming" ? `Due: ${a.due}` : `Grade: ${a.grade || "TBD"}`}</p>
                                    </div>
                                    {isTeacher && (
                                        <div className="assignment-actions">
                                            <button className="btn small" onClick={() => openEditModal(a)}>Edit</button>
                                            <button className="btn small danger" onClick={() => deleteAssignment(a.id)}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Create Assignment Modal */}
                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Create Assignment</h3>
                            <input type="text" placeholder="Assignment Name" value={newAssignmentName} onChange={(e) => setNewAssignmentName(e.target.value)} />
                            <input type="date" placeholder="Due Date" value={newAssignmentDue} onChange={(e) => setNewAssignmentDue(e.target.value)} />
                            <input type="file" accept="application/pdf" onChange={handleFileChange} />
                            {newAssignmentFile && <p>Selected File: {newAssignmentFile.name}</p>}
                            <div className="modal-buttons">
                                <button className="btn" onClick={createAssignment}>Create</button>
                                <button className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Assignment Modal */}
                {showEditModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Edit Assignment</h3>
                            <input type="text" placeholder="Assignment Name" value={newAssignmentName} onChange={(e) => setNewAssignmentName(e.target.value)} />
                            <input type="date" placeholder="Due Date" value={newAssignmentDue} onChange={(e) => setNewAssignmentDue(e.target.value)} />
                            <div className="modal-buttons">
                                <button className="btn" onClick={updateAssignment}>Save</button>
                                <button className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseInfoPage;
