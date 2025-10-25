import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {

    const handleNavigate = (path) => {
        console.log(isLoggedIn);
        onClose();
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
                    <li onClick={() => handleNavigate("/")}>🏠 Home</li>
                    <li onClick={() => handleNavigate(isLoggedIn ? "/profile" : "/account")}>
                        {isLoggedIn ? "👤 Profile" : "👤 Login"}</li>
                    {isLoggedIn && (
                        <li onClick={() => handleNavigate("/saved-foods")}>📖 Saved Foods</li>
                    )}
                    <li onClick={() => handleNavigate("/explore")}>🍽️ Explore</li>
                    <li onClick={() => handleNavigate("/friends")}>👥 Friends</li>
                    <li onClick={() => handleNavigate("/settings")}>⚙️ Settings</li>
                    {isLoggedIn && (
                        <li onClick={handleLogout}>🚪 Logout</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;