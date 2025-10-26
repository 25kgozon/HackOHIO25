import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Pages ---//
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseInfoPage from './pages/CourseInfoPage.jsx';
import AssignmentPage from './pages/AssignmentPage.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import SubmissionDetailsPage from './pages/SubmissionDetailsPage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import HandleFrontendLogin from './pages/HandleFrontendLogin.jsx'
import SettingsPage from './pages/SettingsPage.jsx';

// --- Context ---//
import { UserProvider } from './context/UserContext.jsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/main-page" element={<MainPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseInfoPage />} />
          <Route path="/course/:id/assignment/:assignmentTitle" element={<AssignmentPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/submissions/:submissionId" element={<SubmissionDetailsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/handle_frontend_login" element={<HandleFrontendLogin />} />
          <Route path="/settings" element={<SettingsPage />} />

        </Routes>
      </Router>
    </UserProvider>
  </StrictMode>
);
