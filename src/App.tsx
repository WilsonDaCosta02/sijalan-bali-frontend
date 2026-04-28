import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/user/Landing"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/user/Dashboard"
import CreateReport from "./pages/user/CreateReport"
import ReportHistory from "./pages/user/ReportHistory"
import Profile from "./pages/user/Profile"

import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateReport />} />
        <Route path="/history" element={<ReportHistory />} />
        <Route path="/create-report" element={<CreateReport />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App