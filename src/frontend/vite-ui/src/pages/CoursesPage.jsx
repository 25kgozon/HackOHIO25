import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/CoursesPage.css";

const CoursesPage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const courses = [
        { id: 1, title: "Math 101", instructor: "Prof. Smith", color: "#5b6cff" },
        { id: 2, title: "History 202", instructor: "Prof. Johnson", color: "#7dd3fc" },
        { id: 3, title: "Tax Evasion 101", instructor: "Prof. Tax Evasion", color: "#8bffa4ff" }

    ];

    return (
        <div className="courses-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">GrAIscope | Courses</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="courses-content fade-in">
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="course-card"
                            style={{ borderLeft: `5px solid ${course.color}` }}
                            onClick={() =>
                                navigate(`/course/${course.id}`, {
                                    state: {
                                        courseTitle: course.title,
                                        isTeacher: false
                                    }
                                })
                            }
                        >
                            <h3>{course.title}</h3>
                            <p className="instructor">Instructor: {course.instructor}</p>
                            <button className="btn">Enter Class</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CoursesPage;
