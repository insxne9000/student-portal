import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import './utils/axiosSetup' // Initialize axios interceptors
import AuthWrapper from './components/AuthWrapper'
import DashboardLayout from './components/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Payment from './pages/Payment'
import Course from './pages/Course'
import Summer from './pages/Summer'
import Attendance from './pages/Attendance'
import Clearance from './pages/Clearance'
import Result from './pages/Result'
import Profile from './pages/Profile'
import Notification from './pages/Notification'
import Complaints from './pages/Complaints'
import AdminLogin from './pages/AdminLogin'
import { AdminAuthWrapper, AdminLayout } from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminStudentDetails from './pages/AdminStudentDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminAuthWrapper>
            <AdminLayout />
          </AdminAuthWrapper>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="student/:id" element={<AdminStudentDetails />} />
        </Route>

        {/* Protected Routes inside AuthWrapper and DashboardLayout */}
        <Route path="/" element={
          <AuthWrapper>
            <DashboardLayout />
          </AuthWrapper>
        }>
          <Route index element={<Home />} />
          <Route path="payment" element={<Payment />} />
          <Route path="course" element={<Course />} />
          <Route path="summer" element={<Summer />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="clearance" element={<Clearance />} />
          <Route path="result" element={<Result />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notification" element={<Notification />} />
          <Route path="complaints" element={<Complaints />} />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
