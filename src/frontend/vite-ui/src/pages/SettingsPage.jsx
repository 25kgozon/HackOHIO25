import React from "react";
import "../styles/SettingsPage.css";

const SettingsPage = () => {
    const handleDeleteClick = () => {
        alert("Database deleted!");
    };

    return (
        <div className="settings-page">
            <h1>Settings</h1>
            <button className="delete-btn" onClick={handleDeleteClick}>
                Delete Database
            </button>
        </div>
    );
};

export default SettingsPage;
