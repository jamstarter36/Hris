import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthStorage.jsx'
import api from '../api/auth.js'
import { OvertimeApproval } from '../components/OvertimeApproval'
import {
  MdAccessTime,
  MdCalendarToday,
  MdCancel,
  MdRefresh,
  MdPeople,
  MdMoreTime,
} from 'react-icons/md'

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

const toDateKey = (isoString) => isoString?.slice(0, 10) ?? ''

export const Dashboard = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const isManager = user?.role === 'Manager'

  const [data, setData]  = useState(null)
  const [otHistory, setOtHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [systemOnline, setSystemOnline] = useState(true)
  const [otData, setOtData] = useState(null)
  const [showOTModal, setShowOTModal] = useState(false)

  const showOTModalRef = useRef(showOTModal)
  useEffect(() => { showOTModalRef.current = showOTModal }, [showOTModal])

  const panelLabel = {
    Admin:   'Admin Panel',
    Manager: 'Manager Panel',
    User:    'User Panel',
  }[user?.role] || 'Panel'

  const fetchHistory = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
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

  const fetchOTHistory = async () => {
    if (isAdmin) return
    try {
      const response = await api.get('/timerecord/history-ot-logs')
      const raw = response.data.records || []
      const map = {}
      raw.forEach(r => {
        const key = toDateKey(r.date)
        if (key) map[key] = r
      })
      setOtHistory(map)
    } catch (err) {
      console.log('Could not fetch OT history:', err)
    }
  }

  const fetchOTRequests = async () => {
    try {
      const response = await api.get('/overtime/requests')
      setOtData(response.data)
    } catch (err) {
      console.log('Could not fetch OT requests:', err)
    }
  }

  useEffect(() => {
    fetchHistory()
    fetchOTHistory()
    if (isAdmin || isManager) fetchOTRequests()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showOTModalRef.current) {
        fetchHistory(true)
        fetchOTHistory()
        if (isAdmin || isManager) fetchOTRequests()
      }
    fetchOTRequests()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const records      = data?.records || []
  const totalRecords = isAdmin ? (data?.totalCount || 0) : (data?.totalRecords || 0)

  return (
    <div className="space-y-6">
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

      {/* Cards */}
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

          {isAdmin && (
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
          )}

          {/* OT Requests card — all roles */}
          {(isAdmin || isManager || user?.role === 'User') && (
            <div
              onClick={() => setShowOTModal(true)}
              className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all duration-200">

              {(isAdmin || isManager) && otData?.records?.some(r => r.otStatus === 'Pending' || r.status === 'Pending') && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MdMoreTime className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">OT Requests</p>
                  {(isAdmin || isManager) && (
                    <p className="text-xl font-bold text-gray-800">
                      {otData?.records
                        ? otData.records.filter(r => ['Pending', 'pending'].includes(r.otStatus || r.status)).length
                        : '--'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance logs table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
          {isAdmin && data && (
            <span className="text-xs text-gray-400">
              Showing {records.length} of {totalRecords} records
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <MdRefresh size={24} className="animate-spin mr-2" />
            <span className="text-sm">Loading records...</span>
          </div>
        )}

        {error && !loading && !data && (
          <div className="flex items-center justify-center py-16 text-red-400">
            <MdCancel size={24} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <span className="text-sm">No attendance records found.</span>
          </div>
        )}

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
                  {!isAdmin && <th className="px-5 py-3 text-left">OT In</th>}
                  {!isAdmin && <th className="px-5 py-3 text-left">OT Out</th>}
                  {!isAdmin && <th className="px-5 py-3 text-left">OT Hours</th>}
                  {isAdmin && <th className="px-5 py-3 text-left">Auto Clock Out</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((record, index) => {
                  const ot = !isAdmin ? (otHistory[toDateKey(record.date)] ?? null) : null
                  return (
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
                      {!isAdmin && (
                        <td className="px-5 py-3 font-mono text-gray-600">
                          {formatTime(ot?.otTimeIn)}
                        </td>
                      )}
                      {!isAdmin && (
                        <td className="px-5 py-3 font-mono text-gray-600">
                          {formatTime(ot?.otTimeOut)}
                        </td>
                      )}
                      {!isAdmin && (
                        <td className="px-5 py-3 font-mono text-gray-600">
                          {ot?.actualOvertimeHours != null
                            ? `${ot.actualOvertimeHours.toFixed(2)} hrs`
                            : '--'
                          }
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-5 py-3">
                          {record.isAutoClockOut
                            ? <span className="text-xs font-semibold text-orange-500">Auto</span>
                            : <span className="text-xs text-gray-400">Manual</span>
                          }
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OT Requests Modal */}
      {showOTModal && (
        <OvertimeApproval
          onClose={() => setShowOTModal(false)}
          canApprove={isAdmin || isManager}
        />
      )}
    </div>
  )
}