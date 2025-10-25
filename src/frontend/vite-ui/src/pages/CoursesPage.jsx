import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CoursesPage.css";
import { useUser } from "../context/UserContext.jsx";

const CoursesPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [courses, setCourses] = useState([
        { id: 1, title: "Math 101", instructor: "Prof. Smith", color: "#5b6cff" },
        { id: 2, title: "History 202", instructor: "Prof. Johnson", color: "#7dd3fc" },
        { id: 3, title: "Tax Evasion 101", instructor: "Prof. Tax Evasion", color: "#8bffa4" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newClassName, setNewClassName] = useState("");

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const createClass = () => {
        if (!newClassName.trim()) return alert("Enter a class name!");
        const newCourse = {
            id: Date.now(),
            title: newClassName,
            instructor: user.name || "Teacher",
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };
        setCourses([...courses, newCourse]);
        setNewClassName("");
        setShowModal(false);
    };

    return (
        <div className="courses-page">
            <header className="main-header">
                {user && <button className="menu-btn" onClick={toggleSidebar}>☰</button>}
                <h1 className="title-text">GrAIscope | Courses</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="courses-content fade-in">
                {isTeacher && (
                    <button className="btn" onClick={() => setShowModal(true)}>
                        Create New Class
                    </button>
                )}

                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card" style={{ borderLeft: `5px solid ${course.color}` }}>
                            <h3>{course.title}</h3>
                            <p className="instructor">Instructor: {course.instructor}</p>
                            <button className="btn" onClick={() => navigate(`/course/${course.id}`, {
                                state: { courseTitle: course.title, isTeacher }
                            })}>
                                Enter Class
                            </button>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Create New Class</h3>
                            <input
                                type="text"
                                placeholder="Class Name"
                                value={newClassName}
                                onChange={e => setNewClassName(e.target.value)}
                            />
                            <div className="modal-buttons">
                                <button className="btn" onClick={createClass}>Create</button>
                                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursesPage;
