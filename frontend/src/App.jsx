import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StudentListPage from './pages/Students/StudentListPage';
import AddStudentPage from './pages/Students/AddStudentPage';
import StudentDetailPage from './pages/Students/StudentDetailPage';
import EditStudentPage from './pages/Students/EditStudentPage';
import InquiryPage from './pages/Inquiry/InquiryPage';
import AdmissionPage from './pages/Admissions/AdmissionPage';
import FacultyPage from './pages/Faculty/FacultyPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import AttendanceMarkForm from './pages/Attendance/AttendanceMarkForm';
import SalaryPage from './pages/Salary/SalaryPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'RECEPTIONIST']}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Registry Route */}
        <Route 
          path="/students" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <StudentListPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Enrollment Route */}
        <Route 
          path="/students/add" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AddStudentPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Details Route */}
        <Route 
          path="/students/:id" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}>
              <StudentDetailPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Editing Route */}
        <Route 
          path="/students/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <EditStudentPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Inquiry Pipeline Route */}
        <Route 
          path="/inquiries" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']}>
              <InquiryPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admissions Registry Route */}
        <Route 
          path="/admissions" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST']}>
              <AdmissionPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Faculty Registry Route */}
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <FacultyPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Faculty Attendance Route */}
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <AttendancePage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Mark Attendance Route */}
        <Route 
          path="/attendance/mark" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AttendanceMarkForm />
            </ProtectedRoute>
          } 
        />

        {/* Protected Payroll Ledger Route */}
        <Route 
          path="/salary" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}>
              <SalaryPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
