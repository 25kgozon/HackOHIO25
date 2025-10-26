import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleLogout = async () => {
        try {

            logout();
            location.href = "/api/logout";

        } catch (error) {
            console.error("Logout failed:", error);
            alert("Error logging out. Please try again.");
        }
    };

    return (
        <div className="profile-page">
            {/* Header */}
            <header className="main-header">
                <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                <h1 className="title-text">Profile</h1>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="profile-content fade-in">
                <h2>Welcome, {user.name || "User"}</h2>
                <p>
                    <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>

                <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
            </main>
        </div>
    );
};

export default ProfilePage;
