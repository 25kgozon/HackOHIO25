import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Pages ---//
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseInfoPage from './pages/CourseInfoPage.jsx';
import AssignmentPage from './pages/AssignmentPage.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import HandleFrontendLogin from './pages/HandleFrontendLogin.jsx' 

// --- Context ---//
import { UserProvider } from './context/UserContext.jsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/main-page" element={<MainPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseInfoPage />} />
          <Route path="/course/:id/assignment/:assignmentTitle" element={<AssignmentPage />} />
          <Route path="/submission/:submissionId" element={<SubmittedAssignmentPage />} />

          <Route path="/handle_frontend_login" element={<HandleFrontendLogin />} />
        </Routes>
      </Router>
    </UserProvider>
  </StrictMode>
);
