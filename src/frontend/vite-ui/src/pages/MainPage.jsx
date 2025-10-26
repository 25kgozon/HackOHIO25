import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";

const MainPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Dashboard");
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const { user } = useUser();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    // Fetch classes and assignments
    useEffect(() => {
        if (!user) return;

        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/classes");
                if (!res.ok) throw new Error("Failed to fetch classes");
                let classes = await res.json();
                console.log("Classes fetched:", classes); // <-- check data

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
                            ...cls,
                            upcoming: assignments.map((a) => ({
                                title: a.name,
                                due: a.due || "N/A",
                                grade: a.grade || null,
                                id: a.id,
                            })),
                        };
                    })
                );

                // Safely sort classes by title
                coursesWithAssignments.sort((a, b) =>
                    (a.title || "").localeCompare(b.title || "")
                );

                setCourses(coursesWithAssignments);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCourses();
    }, [user]);


    return (
        <div className="main-page">
            {/* Header */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | {activeSection}</h1>
            </header>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={handleNavigate}
            />

            {/* Main Content */}
            <main className="main-content fade-in">
                <h2 className="page-title">{activeSection}</h2>

                {activeSection === "Dashboard" && (
                    <div className="dashboard-section">
                        {courses.map((course) => (
                            <div key={course.id} className="course-section">
                                {/* Course title */}
                                <h3 className="course-title">{course.title}</h3>

                                {/* Assignments for this course */}
                                <div className="assignment-cards">
                                    {course.upcoming.map((a) => (
                                        <div
                                            key={a.id}
                                            className="assignment-card upcoming"
                                            onClick={() =>
                                                navigate(`/course/${course.id}/assignment/${a.title}`, {
                                                    state: { courseTitle: course.title, assignmentDetails: a },
                                                })
                                            }
                                        >
                                            <strong>{a.title}</strong>
                                            <p>Due: {a.due}</p>
                                            {a.grade && <p>Grade: {a.grade}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection !== "Dashboard" && (
                    <div className={`placeholder-section ${activeSection.toLowerCase()}`}>
                        <p>📚 Placeholder content for {activeSection}.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MainPage;
