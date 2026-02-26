    import { useState, useEffect } from 'react'
    import { useAuth } from './context/AuthStorage'
    import api from './api/auth.js'
    import {
    MdAccessTime,
    MdCalendarToday,
    MdCheckCircle,
    MdCancel,
    MdSchedule,
    MdRefresh,
    MdPeople,
    } from 'react-icons/md'

    const STATUS_STYLES = {
    'Present':  'bg-green-100 text-green-700 border border-green-200',
    'Half Day': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Late':     'bg-orange-100 text-orange-700 border border-orange-200',
    'Absent':   'bg-red-100 text-red-700 border border-red-200',
    'Pending':  'bg-gray-100 text-gray-600 border border-gray-200',
    }

    const formatTime = (isoString) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    }

    const formatDate = (isoString) => {
    if (!isoString) return '---'
    return new Date(isoString).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    })
    }

    export const Dashboard = () => {
    const { user } = useAuth()
    const isAdmin = user?.role === 'Admin'

    const [data, setData]               = useState(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState('')
    const [systemOnline, setSystemOnline] = useState(true)

    const panelLabel = {
        Admin:   'Admin Panel',
        Manager: 'Manager Panel',
        User:    'User Panel',
    }[user?.role] || 'Panel'

    const fetchHistory = async (silent = false) => {
        if (!silent) setLoading(true)
        setError('')
        try {
        // Admin uses /records endpoint, others use /history
        const endpoint = isAdmin ? '/timerecord/records' : '/timerecord/history'
        const response = await api.get(endpoint)
        setData(response.data)
        setSystemOnline(true)
        } catch (err) {
        setSystemOnline(false)
        setError('Failed to load attendance history.')
        } finally {
        if (!silent) setLoading(false)
        }
    }

    useEffect(() => { fetchHistory() }, [])
    useEffect(() => {
        const interval = setInterval(() => { fetchHistory(true) }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Normalize records — admin and employee endpoints have different shapes
    const records = isAdmin ? (data?.records || []) : (data?.records || [])
    const totalRecords = isAdmin ? (data?.totalCount || 0) : (data?.totalRecords || 0)

    return (
        <div className="space-y-6">

        {/* Page header */}
        <div>
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-gray-500">{panelLabel}</span>
            <span className="text-gray-300">·</span>
            {systemOnline ? (
                <span className="flex items-center gap-1 text-sm text-green-500 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                <span className="text-[10px]">System Active</span>
                </span>
            ) : (
                <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                <span className="text-[10px]">System Offline</span>
                </span>
            )}
            </div>
        </div>

        {/* Summary cards */}
        {data && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <MdCalendarToday className="text-blue-600" size={20} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Records</p>
                    <p className="text-xl font-bold text-gray-800">{totalRecords}</p>
                </div>
                </div>
            </div>
            {!isAdmin && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                    <MdCheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Present Days</p>
                    <p className="text-xl font-bold text-gray-800">
                    {records.filter(r => r.attendanceStatus === 'Present').length}
                    </p>
                </div>
                </div>
            </div>
            )}
            {!isAdmin && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                    <MdSchedule className="text-yellow-600" size={20} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">Half Days</p>
                    <p className="text-xl font-bold text-gray-800">
                    {records.filter(r => r.attendanceStatus === 'Half Day').length}
                    </p>
                </div>
                </div>
            </div>
            )}

            {/* Admin sees unique employees, others see late days */}
            {isAdmin ? (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                    <MdPeople className="text-purple-600" size={20} />
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Employees</p>
                    <p className="text-xl font-bold text-gray-800">
                        {new Set(records.map(r => r.employeeId)).size}
                    </p>
                    </div>
                </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                    <MdCancel className="text-red-600" size={20} />
                    </div>
                    <div>
                    <p className="text-xs text-gray-500">Late Days</p>
                    <p className="text-xl font-bold text-gray-800">
                        {records.filter(r => r.isLate).length}
                    </p>
                    </div>
                </div>
                </div>
            )}
            </div>
        )}

        {/* Attendance logs table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Table header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
                <MdAccessTime size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                {isAdmin ? 'Attendance Logs - All Employees' : 'Attendance Logs'}{' '}
                {!isAdmin && records.length > 0
                    ? `— ${new Date(records[0].date).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                    : ''
                }
                </h3>
            </div>
            {/* Pagination info for admin */}
            {isAdmin && data && (
                <span className="text-xs text-gray-400">
                Showing {records.length} of {totalRecords} records
                </span>
            )}
            </div>

            {/* Loading */}
            {loading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
                <MdRefresh size={24} className="animate-spin mr-2" />
                <span className="text-sm">Loading records...</span>
            </div>
            )}

            {/* Error */}
            {error && !loading && !data && (
            <div className="flex items-center justify-center py-16 text-red-400">
                <MdCancel size={24} className="mr-2" />
                <span className="text-sm">{error}</span>
            </div>
            )}

            {/* Empty */}
            {!loading && !error && records.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-400">
                <span className="text-sm">No attendance records found.</span>
            </div>
            )}

            {/* Table */}
            {records.length > 0 && (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                    {isAdmin && <th className="px-5 py-3 text-left">Employee ID</th>}
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Time In</th>
                    <th className="px-5 py-3 text-left">Time Out</th>
                    {isAdmin && <th className="px-5 py-3 text-left">Schedule</th>}
                    <th className="px-5 py-3 text-left">Hours Worked</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Late</th>
                    <th className="px-5 py-3 text-left">Undertime</th>
                    {isAdmin && <th className="px-5 py-3 text-left">Auto Clock Out</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {records.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        {isAdmin && (
                        <td className="px-5 py-3 font-mono text-gray-500 text-xs">
                            #{record.employeeId}
                        </td>
                        )}
                        <td className="px-5 py-3 font-medium text-gray-700">
                        {formatDate(record.date)}
                        </td>
                        <td className="px-5 py-3 font-mono text-gray-600">
                        {formatTime(record.timeIn)}
                        </td>
                        <td className="px-5 py-3 font-mono text-gray-600">
                        {formatTime(record.timeOut)}
                        </td>
                        {isAdmin && (
                        <td className="px-5 py-3 text-gray-600">
                            {record.workScheduleName || '--'}
                        </td>
                        )}
                        <td className="px-5 py-3 font-mono text-gray-600">
                        {record.totalHoursWorked > 0
                            ? `${record.totalHoursWorked.toFixed(2)} hrs`
                            : '--'
                        }
                        </td>
                        <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[record.attendanceStatus] || STATUS_STYLES['Pending']}`}>
                            {record.attendanceStatus}
                        </span>
                        </td>
                        <td className="px-5 py-3">
                        {record.isLate
                            ? <span className="text-xs font-semibold text-orange-600">+{record.tardinessMinutes} mins</span>
                            : <span className="text-xs text-green-500">On time</span>
                        }
                        </td>
                        <td className="px-5 py-3">
                        {record.isUndertime
                            ? <span className="text-xs font-semibold text-red-500">{record.undertimeMinutes} mins</span>
                            : <span className="text-xs text-green-500">None</span>
                        }
                        </td>
                        {isAdmin && (
                        <td className="px-5 py-3">
                            {record.isAutoClockOut
                            ? <span className="text-xs font-semibold text-orange-500">Auto</span>
                            : <span className="text-xs text-gray-400">Manual</span>
                            }
                        </td>
                        )}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    )
    }