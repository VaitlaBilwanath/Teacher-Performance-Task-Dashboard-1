/* src/App.jsx */
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// 1. Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// 2. Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import StaffAttendance from './pages/admin/StaffAttendance';
import DutyRoster from './pages/admin/DutyRoster';
import TaskBoard from './pages/admin/TaskBoard';
import Reports from './pages/admin/Reports';
import Announcements from './pages/admin/Announcements';
import AdminManageUsers from './pages/admin/AdminManageUsers';
import AuditLogs from './pages/admin/AuditLogs';

// 3. Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import DailyRoutineLog from './pages/teacher/DailyRoutineLog';
import TeacherTasks from './pages/teacher/TeacherTasks';
import MyClass from './pages/teacher/MyClass';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import StudentNotes from './pages/teacher/StudentNotes';

// 4. Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildDetail from './pages/parent/ChildDetail';
import DailyRoutineDetail from './pages/parent/DailyRoutineDetail';
import ActivityTimeline from './pages/parent/ActivityTimeline';
import TeacherNotes from './pages/parent/TeacherNotes';
import Messages from './pages/parent/Messages';

// 5. Settings Pages
import Settings from './pages/settings/Settings';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN PORTAL ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AuditLogs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Teachers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Students /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminManageUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><StaffAttendance /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><TaskBoard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/roster" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><DutyRoster /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        } />

        {/* TEACHER PORTAL ROUTES */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><TeacherDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/class" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><MyClass /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/attendance" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><TeacherAttendance /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/routinelog" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><DailyRoutineLog /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/tasks" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><TeacherTasks /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/notes" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><StudentNotes /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/announcements" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/profile" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        {/* PARENT PORTAL ROUTES */}
        <Route path="/parent/dashboard" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><ParentDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/child" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><ChildDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/updates" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><DailyRoutineDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/timeline" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><ActivityTimeline /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/notes" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><TeacherNotes /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/announcements" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/messages" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><Messages /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent/profile" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        {/* Shared Child Detail route for teachers & admins */}
        <Route path="/child/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
            <Layout><ChildDetail /></Layout>
          </ProtectedRoute>
        } />

        {/* Dynamic User Profile page */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
            <Layout><UserProfilePage /></Layout>
          </ProtectedRoute>
        } />

        {/* GENERAL SETTINGS ROUTE (Admin default) */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
