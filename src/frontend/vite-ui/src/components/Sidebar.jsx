import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {
    const navigate = useNavigate();
    const handleNavigate = (path) => {
        console.log(path);
        onClose();
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token"); // ✅ clear token
        onClose();
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebarContent">
                {/* Close button */}
                <button className="closeBtn" onClick={onClose}>
                    ✕
                </button>

                {/* Menu items */}
                <ul className="sidebarMenu">
                    <li onClick={() => handleNavigate("/login")}>👤 Login / Profile</li>
                    <li onClick={() => handleNavigate("/")}>🏠 Dashboard</li>
                    <li onClick={() => handleNavigate("/courses")}>📚 Courses</li>
                    <li onClick={() => handleNavigate("/assignments")}>📝 Assignments</li>
                    <li onClick={() => handleNavigate("/submissions")}>📤 Submissions</li>
                    <li onClick={() => handleNavigate("/grades")}>📊 Grades</li>
                    <li onClick={() => handleNavigate("/settings")}>⚙️ Settings</li>
                </ul>

            </div>
        </div>
    );
};

export default Sidebar;