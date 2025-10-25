import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from localStorage once when provider mounts
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = (name, role) => {
        const newUser = { name, role };
        setUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook to access user context
export const useUser = () => useContext(UserContext);
