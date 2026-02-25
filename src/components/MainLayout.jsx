import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthStorage'
import { TimePunch } from './TimePunch'
import LoginLogo from '../images/AardenceLogo2.png'
import {
  MdDashboard,
  MdPeople,
  MdAccessTime,
  MdAttachMoney,
  MdBarChart,
  MdManageAccounts,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
} from 'react-icons/md'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: MdDashboard, path: '/dashboard', roles: ['Admin', 'Manager', 'User', 'Guest'] },
  { label: 'Employee Management', icon: MdPeople, path: '/employees', roles: ['Admin', 'Manager'] },
  { label: 'Attendance & Leave', icon: MdAccessTime, path: '/attendance', roles: ['Admin', 'Manager', 'User'] },
  { label: 'Payroll', icon: MdAttachMoney, path: '/payroll', roles: ['Admin', 'Manager', 'User'] },
  { label: 'Reports & Analytics', icon: MdBarChart, path: '/reports', roles: ['Admin', 'Manager'] },
  { label: 'User Management', icon: MdManageAccounts, path: '/user-management', roles: ['Admin'] },
  { label: 'System Settings', icon: MdSettings, path: '/settings', roles: ['Admin'] },
]

const ROLE_STYLES = {
  Admin: 'bg-red-500/20 text-red-300 border border-red-500/30',
  Manager: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  User: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Guest: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
}

export const MainLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const handleNavClick = () => {
    if (mobileOpen) setMobileOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}/>
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30
          flex flex-col bg-[#0f172a] text-white
          transition-all duration-300 ease-in-out shadow-2xl
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center p-4 border-b border-white/10
          ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? 'lg:hidden' : ''}`}>
            <img src={LoginLogo} className="w-8 h-8 shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-wide text-white">Aardence</p>
              <p className="text-[10px] text-gray-400">HRIS</p>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
            {collapsed ? <MdMenu size={20} /> : <MdClose size={20} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 ml-auto">
            <MdClose size={20} />
          </button>

        </div>
        <div className={`mx-3 mt-4 mb-2 p-3 rounded-xl bg-white/5 border border-white/10 ${collapsed ? 'lg:hidden' : ''}`}>
          <p className="text-xs text-gray-400 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[user?.role]}`}>
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
                ${collapsed ? 'lg:justify-center' : ''}`}
              title={collapsed ? label : undefined}>
              <Icon size={20} className="shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-200
              ${collapsed ? 'lg:justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}>
            <MdLogout size={20} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">

        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors">
              <MdMenu size={24} />
            </button>
            <h1 className="text-gray-800 font-semibold text-xs lg:text-sm tracking-wide uppercase truncate">
              <span className="hidden lg:inline">Human Resource Information System</span>
              <span className="inline lg:hidden">AARDENCE HRIS</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 hidden sm:block">Welcome,</span>
            <span className="text-xs font-bold text-gray-800">{user?.username}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>

        <TimePunch />

      </main>
    </div>
  )
}