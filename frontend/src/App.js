import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyManagement from './pages/FacultyManagement';
import StudentManagement from './pages/StudentManagement';
import SubjectManagement from './pages/SubjectManagement';
import MarksEntry from './pages/MarksEntry';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AttendanceEntry from './pages/AttendanceEntry';
import ReportCard from './pages/ReportCard';
import StudentSyllabus from './pages/StudentSyllabus';
import StudentFeedback from './pages/StudentFeedback';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!token || !user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty" element={
          <ProtectedRoute role="Admin">
            <FacultyManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute role="Admin">
            <StudentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/subjects" element={
          <ProtectedRoute role="Admin">
            <SubjectManagement />
          </ProtectedRoute>
        } />
        <Route path="/faculty" element={
          <ProtectedRoute role="Faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/marks" element={
          <ProtectedRoute role="Faculty">
            <MarksEntry />
          </ProtectedRoute>
        } />
        <Route path="/faculty/attendance" element={
          <ProtectedRoute role="Faculty">
            <AttendanceEntry />
          </ProtectedRoute>
        } />
        <Route path="/student" element={
          <ProtectedRoute role="Student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/report" element={
          <ProtectedRoute role="Student">
            <ReportCard />
          </ProtectedRoute>
        } />
        <Route path="/student/syllabus" element={
          <ProtectedRoute role="Student">
            <StudentSyllabus />
          </ProtectedRoute>
        } />
        <Route path="/student/feedback" element={
          <ProtectedRoute role="Student">
            <StudentFeedback />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
