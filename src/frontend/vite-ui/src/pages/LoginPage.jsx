import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/LoginPage.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Email:", email, "Password:", password);
        alert("Login button clicked (frontend-only)");
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="login-page">
            {/* Sidebar Toggle Button */}
            <button className="menu-btn" onClick={toggleSidebar}>
                ☰
            </button>

            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Centered Login Card */}
            <div className="login-card card fade-in">
                <h1 className="iridescent">Login</h1>
                <form onSubmit={handleLogin} className="login-form">
                    <label>Email</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn">Login</button>
                </form>
                <p className="login-footer">
                    Don't have an account? <a href="#">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
