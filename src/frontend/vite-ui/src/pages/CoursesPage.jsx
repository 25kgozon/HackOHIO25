import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CoursesPage.css";
import { useUser } from "../context/UserContext.jsx";

const CoursesPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [newClassDesc, setNewClassDesc] = useState("");
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // ---------------------------
    // 🧩 Fetch classes from backend
    // ---------------------------
    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes", {
                credentials: "include", // very important to keep session cookies
            });
            if (!res.ok) throw new Error("Failed to fetch classes");
            const data = await res.json();
            setCourses(data || []);
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on load
    useEffect(() => {
        if (user) fetchClasses();
    }, [user]);

    // ---------------------------
    // ✨ Create a new class (POST)
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

            // Refresh course list after creation
            await fetchClasses();
            setNewClassName("");
            setNewClassDesc("");
            setShowModal(false);
        } catch (err) {
            console.error("Error creating class:", err);
            alert("Error creating class");
        }
    };

    return (
        <div className="courses-page">
            <header className="main-header">
                {user && (
                    <button className="menu-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                )}
                <h1 className="title-text">GrAIscope | Courses</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="courses-content fade-in">
                {isTeacher && (
                    <button className="btn" onClick={() => setShowModal(true)}>
                        Create New Class
                    </button>
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
                                        borderLeft: `5px solid #${Math.floor(
                                            Math.random() * 16777215
                                        ).toString(16)}`,
                                    }}
                                >
                                    <h3>{course.name}</h3>
                                    <p className="instructor">
                                        Instructor: {user?.name || "Unknown"}
                                    </p>
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

                {/* Modal */}
                {showModal && (
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
                                <button className="btn" onClick={createClass}>
                                    Create
                                </button>
                                <button className="btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursesPage;
