import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/GradesPage.css";

const GradesPage = () => {
    const { user } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [gradesByCourse, setGradesByCourse] = useState([]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Mock grades grouped by course
    useEffect(() => {
        const mockGrades = [
            {
                courseTitle: "Calculus 101",
                students: [
                    { name: "Alice Johnson", grade: "95%" },
                    { name: "Bob Smith", grade: "88%" },
                ],
            },
            {
                courseTitle: "Physics 201",
                students: [
                    { name: "Charlie Brown", grade: "92%" },
                    { name: "David Lee", grade: "85%" },
                ],
            },
        ];
        setGradesByCourse(mockGrades);
    }, []);

    return (
        <div className="grades-page">
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text iridescent">Student Grades</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="grades-content fade-in">
                <h2>Grades Overview</h2>

                {gradesByCourse.map((course, idx) => (
                    <div key={idx} className="course-section">
                        <h3 className="course-title">{course.courseTitle}</h3>
                        <ul className="grades-list">
                            {course.students.map((s, i) => (
                                <li key={i} className="grade-item">
                                    <span>{s.name}</span>
                                    <span>{s.grade}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default GradesPage;
