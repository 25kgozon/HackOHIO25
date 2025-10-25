import React, { createContext, useState, useEffect } from "react";

export const AssignmentsContext = createContext();

export const AssignmentsProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Example: fetch initial course list (without assignments)
    useEffect(() => {
        async function fetchCourses() {
            try {
                setLoading(true);
                // Replace this URL with your actual API endpoint later
                const response = await fetch("/api/courses");
                const data = await response.json();
                setCourses(data); // expected format: [{id, title, upcoming: []}]
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    // Update assignments for a course
    const updateAssignments = (courseId, assignments) => {
        setCourses(prev =>
            prev.map(course =>
                course.id === courseId ? { ...course, upcoming: assignments } : course
            )
        );
    };

    return (
        <AssignmentsContext.Provider value={{ courses, updateAssignments, loading, error }}>
            {children}
        </AssignmentsContext.Provider>
    );
};
