import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthStorage'
import ProtectedRoute from './components/ProtectedRoute'
import { LoginPage } from './components/LoginPage'
import { MainLayout } from './components/MainLayout'
import { Dashboard } from './Dashboard'
import { Employees } from './Employees'
import { Attendance } from './Attendance'
import { Payroll } from './Payroll'
import { Reports } from './Reports'
import { UserManagement } from './UserManagement'
import { SystemSettings } from './SystemSettings'


const Unauthorized   = () => <div className="flex items-center justify-center h-full"><h2 className="text-2xl font-bold text-red-500">🚫 Access Denied</h2></div>

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['Admin', 'Manager', 'User', 'Guest']}
                element={<MainLayout />}
              />
            }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} element={<Employees />} />} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} element={<Reports />} />} />
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'User']} element={<Attendance />} />} />
            <Route path="/payroll" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'User']} element={<Payroll />} />} />
            <Route path="/user-management" element={<ProtectedRoute allowedRoles={['Admin']} element={<UserManagement />} />} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['Admin']} element={<SystemSettings />} />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </AuthProvider>
  )
}
export default App