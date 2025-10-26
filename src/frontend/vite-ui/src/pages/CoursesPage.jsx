import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CoursesPage.css";
import { useUser } from "../context/UserContext.jsx";

const CoursesPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const isTeacher = user?.role === "teacher";

    const [newClassName, setNewClassName] = useState("");
    const [newInstructor, setNewInstructor] = useState("");
    const [newClassDesc, setNewClassDesc] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Random pools for student joining
    const classNames = [
        "Intro to AI",
        "Web Development 101",
        "Data Structures & Algorithms",
        "Machine Learning Foundations",
        "Operating Systems",
        "Discrete Math for CS",
        "Human-Computer Interaction",
        "Database Systems",
        "Cybersecurity Basics",
        "Computer Networks",
        "Software Engineering",
        "Intro to Game Design",
        "Cloud Computing",
        "Data Science & Visualization",
        "Programming Languages"
    ];

    const instructorNames = [
        "Dr. Johnson",
        "Prof. Nguyen",
        "Dr. Lee",
        "Ms. Alvarez",
        "Mr. Patel",
        "Dr. Thompson",
        "Prof. O'Connor",
        "Ms. Chen",
        "Dr. Rivera",
        "Prof. Adams"
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

    // ---------- Create Class (Teacher) ----------
    const createClass = async () => {
        if (!newClassName.trim()) return alert("Please enter a class name.");
        if (!newInstructor.trim()) return alert("Please enter an instructor name.");
        if (!newClassDesc.trim()) return alert("Please enter a description.");

        try {
            const res = await fetch("/api/create_class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: newClassName,
                    instructor: newInstructor,
                    desc: newClassDesc,
                }),
            });

            if (!res.ok) throw new Error("Failed to create class");

            const data = await res.json();
            alert(`Class created! (${newClassName} by ${newInstructor})`);
            setNewClassName("");
            setNewInstructor("");
            setNewClassDesc("");
            setShowCreateModal(false);
            fetchClasses(); // Refresh class list
        } catch (err) {
            console.error("Error creating class:", err);
            alert("Failed to create class");
        }
    };

    // ---------- Simulated Join Class (Student) ----------
    const joinRandomClass = () => {
        const randomName = classNames[Math.floor(Math.random() * classNames.length)];
        const randomInstructor = instructorNames[Math.floor(Math.random() * instructorNames.length)];
        const fakeDesc = `${randomName} - Introductory course for students`;

        const fakeClass = {
            id: Math.random().toString(36).substring(2, 10),
            name: randomName,
            instructor: randomInstructor,
            desc: fakeDesc,
        };

        setCourses((prev) => [...prev, fakeClass]);
        setShowJoinModal(false);
        alert(`Joined random class: ${randomName}`);
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
                    <button className="btn" onClick={() => setShowCreateModal(true)}>Create Class</button>
                ) : (
                    <button className="btn" onClick={() => setShowJoinModal(true)}>Join Random Class</button>
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
                                    <p className="description">{course.desc || "No description provided."}</p>
                                    <button
                                        className="btn"
                                        onClick={() =>
                                            navigate(`/course/${course.id || course._id}`, {
                                                state: { courseTitle: course.title, isTeacher },
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
                            <h3>Create Class</h3>
                            <input
                                type="text"
                                placeholder="Class Name"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Instructor Name"
                                value={newInstructor}
                                onChange={(e) => setNewInstructor(e.target.value)}
                            />
                            <textarea
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

                {/* Join Random Class Modal */}
                {showJoinModal && (
                    <div className="modal-overlay">
                        <div className="modal-content fade-in">
                            <h3>Join a Random Class</h3>
                            <p>Click below to join a randomly generated class.</p>
                            <div className="modal-buttons">
                                <button className="btn" onClick={joinRandomClass}>Join Random Class</button>
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
