import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthStorage'
import api from '../api/auth'
import {
  MdNotifications,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md'

export const NotificationSection = () => {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [hasUnread, setHasUnread] = useState(false)
  const notifRef = useRef(null)

  const fetchNotifications = async () => {
    if (!user || user.role === 'Admin') return
    try {
      const response = await api.get('/timerecord/history-ot')
      const records = response.data.records || []

     
      const filtered = records.filter(r =>
        ['Approved', 'approved', 'Rejected', 'rejected'].includes(r.otStatus)
      )
      setNotifications(filtered)

      setHasUnread(filtered.some(r => r.isNew === true))
    } catch (err) {
      console.log('Could not fetch notifications:', err)
    }
  }

  const markAsSeen = async () => {
    try {
      await api.post('/timerecord/mark-notifications-seen')
    } catch (err) {
      console.log('Could not mark notifications as seen:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBellClick = async () => {
    const next = !notifOpen
    setNotifOpen(next)
    if (next && hasUnread) {
      setHasUnread(false)
      await markAsSeen()
    }
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  if (user?.role === 'Admin') return null

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={handleBellClick}
        className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-150">
        <MdNotifications size={22} />
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Notifications</span>
            <span className="text-xs text-gray-400">{notifications.length} total</span>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <MdNotifications size={28} className="text-gray-300" />
              <span className="text-sm">No notifications yet</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {notifications.map((n, i) => {
                const isApproved = ['Approved', 'approved'].includes(n.otStatus)
                return (
                  <div
                    key={i}
                    className={'flex items-start gap-3 px-4 py-3 transition-colors ' + (n.isNew ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50')}>
                    <div className="mt-0.5 shrink-0">
                      {isApproved
                        ? <MdCheckCircle size={18} className="text-green-500" />
                        : <MdCancel size={18} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-700">
                          OT Request {isApproved ? 'Approved' : 'Rejected'}
                        </p>
                        {n.isNew && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white animate-pulse">NEW</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(n.date)} · {n.requestedHours} hrs requested
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}