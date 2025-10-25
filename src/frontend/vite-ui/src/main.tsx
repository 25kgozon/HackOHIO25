import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Pages ---//
import MainPage from './pages/MainPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import CourseInfoPage from './pages/CourseInfoPage.jsx'
import AssignmentPage from './pages/AssignmentPage.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:id" element={<CourseInfoPage />} />
        <Route path="/course/:id/assignment/:assignmentTitle" element={<AssignmentPage />} />


      </Routes>
    </Router>
  </StrictMode>,
)
