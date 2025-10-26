import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ required
import Sidebar from "../components/Sidebar";
import "../styles/CoursesPage.css";
import { useUser } from "../context/UserContext.jsx";

const CoursesPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [newClassDesc, setNewClassDesc] = useState("");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Fetch classes
    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch classes");
            const data = await res.json();
            setCourses(data || []);
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchClasses();
    }, [user]);

    // ---------------------------
    // ✨ Create Class (Teacher)
    // ---------------------------
    const createClass = async () => {
        if (!newClassName.trim()) return alert("Enter a class name!");
        try {
            const res = await fetch("/api/create_class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: newClassName,
                    desc: newClassDesc || "No description",
                }),
            });

            if (!res.ok) throw new Error("Failed to create class");

            const data = await res.json();
            alert(`Class created! ID: ${data.id}`);
            setNewClassName("");
            setNewClassDesc("");
            setShowCreateModal(false);
            fetchClasses();
        } catch (err) {
            console.error("Error creating class:", err);
            alert("Failed to create class");
        }
    };

    // ---------------------------
    // ✨ Join Class (Student)
    // ---------------------------
    const joinClass = async () => {
        if (!joinCode.trim()) return alert("Enter a class code!");
        try {
            const res = await fetch("/api/join_class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ code: joinCode }),
            });
            if (!res.ok) throw new Error("Failed to join class");
            const data = await res.json();
            alert(`Successfully joined class: ${data.class_name}`);
            setJoinCode("");
            setShowJoinModal(false);
            fetchClasses();
        } catch (err) {
            console.error("Error joining class:", err);
            alert("Failed to join class. Check the code and try again.");
        }
    };

    return (
        <div className="courses-page">
            <header className="main-header">
                {user && <button className="menu-btn" onClick={toggleSidebar}>☰</button>}
                <h1 className="title-text">GrAIscope | Courses</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="courses-content fade-in">
                {isTeacher ? (
                    <button className="btn" onClick={() => setShowCreateModal(true)}>Create New Class</button>
                ) : (
                    <button className="btn" onClick={() => setShowJoinModal(true)}>Join Class</button>
                )}

                {loading ? (
                    <p>Loading classes...</p>
                ) : (
                    <div className="courses-grid">
                        {courses.length === 0 ? (
                            <p>No classes yet.</p>
                        ) : (
                            courses.map((course) => (
                                <div
                                    key={course.id || course._id || course.name}
                                    className="course-card"
                                    style={{
                                        borderLeft: `5px solid #${Math.floor(Math.random() * 16777215).toString(16)}`,
                                    }}
                                >
                                    <h3>{course.name}</h3>
                                    <p className="instructor">Instructor: {course.instructor || "Unknown"}</p>
                                    <button
                                        className="btn"
                                        onClick={() =>
                                            navigate(`/course/${course.id || course._id}`, {
                                                state: { courseTitle: course.name, isTeacher },
                                            })
                                        }
                                    >
                                        Enter Class
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Create Class Modal */}
                {showCreateModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Create New Class</h3>
                            <input
                                type="text"
                                placeholder="Class Name"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Class Description"
                                value={newClassDesc}
                                onChange={(e) => setNewClassDesc(e.target.value)}
                            />
                            <div className="modal-buttons">
                                <button className="btn" onClick={createClass}>Create</button>
                                <button className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Join Class Modal */}
                {showJoinModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Join Class</h3>
                            <input
                                type="text"
                                placeholder="Enter 6-digit class code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                            />
                            <div className="modal-buttons">
                                <button className="btn" onClick={joinClass}>Join</button>
                                <button className="btn" onClick={() => setShowJoinModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursesPage;
