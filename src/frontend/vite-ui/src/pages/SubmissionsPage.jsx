import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/SubmissionsPage.css";

// Sample submitted assignments data
const submittedAssignments = [
    {
        courseId: 1,
        courseTitle: "Calculus 101",
        submissions: [
            { id: 1, title: "Homework 1", student: "Alice", submittedOn: "Oct 15", grade: "95%", comments: ["Good work!", "Check question 2"] },
            { id: 2, title: "Quiz 1", student: "Bob", submittedOn: "Oct 17", grade: "88%", comments: ["Review question 3"] },
        ],
    },
    {
        courseId: 2,
        courseTitle: "Physics 201",
        submissions: [
            { id: 3, title: "Lab Report 0", student: "Charlie", submittedOn: "Oct 14", grade: "100%", comments: [] },
            { id: 4, title: "Homework 1", student: "David", submittedOn: "Oct 16", grade: "92%", comments: ["Well done!"] },
        ],
    },
];

const SubmissionsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Submissions");
    const navigate = useNavigate();
    const { user } = useUser(); // ✅ get logged-in user

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleNavigate = (section) => {
        setActiveSection(section);
        setIsSidebarOpen(false);
    };

    // Determine if the user is a student
    const isStudent = user?.role === "student";

    // If student, filter + replace names with user's own name
    const displayedAssignments = isStudent
        ? submittedAssignments.map(course => ({
            ...course,
            submissions: course.submissions.map(sub => ({
                ...sub,
                student: user.name, // replace all names with logged-in student's name
            })),
        }))
        : submittedAssignments;

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
                    {displayedAssignments.map((course) => (
                        <div key={course.courseId} className="course-section">
                            <h3 className="course-title">{course.courseTitle}</h3>
                            <div className="submission-cards">
                                {course.submissions.map((sub) => (
                                    <div key={sub.id} className="submission-card">
                                        <div>
                                            <strong>{sub.title}</strong> - {sub.student}
                                        </div>
                                        <div>
                                            Submitted: {sub.submittedOn} | Grade: {sub.grade}
                                        </div>
                                        <button
                                            className="btn"
                                            onClick={() =>
                                                navigate(`/submissions/${sub.id}`, {
                                                    state: { submission: sub, courseTitle: course.courseTitle }
                                                })
                                            }
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SubmissionsPage;
