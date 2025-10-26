import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/SubmissionsPage.css";

const SubmissionsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Submissions");
    const [assignmentsByCourse, setAssignmentsByCourse] = useState([]);
    const { user } = useUser();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    // Fetch assignments grouped by course
    useEffect(() => {
        if (!user) return;

        const fetchAssignments = async () => {
            try {
                const res = await fetch("/api/classes", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch classes");
                const classes = await res.json();

                const coursesWithAssignments = await Promise.all(
                    classes.map(async (cls) => {
                        const assignmentRes = await fetch("/api/get_class_assignments", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ "class id": cls.id }),
                        });
                        if (!assignmentRes.ok) throw new Error("Failed to fetch assignments");
                        const assignments = await assignmentRes.json();
                        return {
                            courseId: cls.id,
                            courseTitle: cls.name || cls.title || "Untitled Course",
                            assignments: assignments.map((a) => ({
                                id: a.id,
                                title: a.name,
                                due: a.attrs?.due || "TBD",
                                grade: a.grade || null,
                            })),
                        };
                    })
                );

                setAssignmentsByCourse(coursesWithAssignments);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAssignments();
    }, [user]);

    return (
        <div className="main-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | {activeSection}</h1>
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            <main className="main-content fade-in">
                <h2 className="page-title">{activeSection}</h2>

                <div className="submissions-section">
                    {assignmentsByCourse.length === 0 ? (
                        <p>No assignments found.</p>
                    ) : (
                        assignmentsByCourse.map((course) => (
                            <div key={course.courseId} className="course-section">
                                <h3 className="course-title">{course.courseTitle}</h3>
                                <div className="submission-cards">
                                    {course.assignments.map((ass) => (
                                        <div key={ass.id} className="submission-card">
                                            <div>
                                                <strong>{ass.title}</strong>
                                            </div>
                                            <div>Due: {ass.due} | Grade: {ass.grade || "TBD"}</div>
                                            <button
                                                className="btn"
                                                onClick={() =>
                                                    navigate(`/submissions/${ass.id}`, {
                                                        state: { submiss: ass, courseTitle: course.courseTitle }
                                                    })
                                                }
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default SubmissionsPage;
