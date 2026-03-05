import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MdClose, MdMoreTime, MdRefresh } from 'react-icons/md'
import api from '../api/auth'
import { useAuth } from '../context/AuthStorage.jsx'

const STATUS_STYLES = {
  'Pending':  'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'Approved': 'bg-green-100 text-green-700 border border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border border-red-200',
  'pending':  'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'approved': 'bg-green-100 text-green-700 border border-green-200',
  'rejected': 'bg-red-100 text-red-700 border border-red-200',
}

export const OvertimeApproval = ({ onClose, canApprove }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const loggedInEmployeeId = parseInt(user?.id, 10)
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [remarks, setRemarks]         = useState('')

  const selectedRecord = records.find(r => r._rowKey === selectedId) ?? null

  // Admin can approve anyone. Manager cannot approve their own OT request.
  const canActOnRecord = selectedRecord
    ? isAdmin || selectedRecord.employeeId !== loggedInEmployeeId
    : false

  useEffect(() => {
    const fetchOTRequests = async () => {
      try {
        const isUser = user?.role === 'User'
        const endpoint = isUser ? '/overtime/requests-user' : '/overtime/requests'
        const response = await api.get(endpoint)
        const topEmployeeId = response.data.employeeId
        const raw = response.data.records || []
        const fetched = raw.map((r, i) => ({
          ...r,
          employeeId: r.employeeId ?? topEmployeeId,
          otStatus: r.otStatus || r.status || 'Pending',
          _rowKey: r.overtimeRequestId != null ? String(r.overtimeRequestId) : (r.employeeId ?? topEmployeeId) + '-' + r.date + '-' + i,
        }))
        setRecords(fetched)
      } catch (err) {
        setError('Failed to load OT requests.')
      } finally {
        setLoading(false)
      }
    }
    fetchOTRequests()
  }, [])

  const handleRowClick = (record) => {
    setSelectedId(prev => {
      if (prev === record._rowKey) { setRemarks(''); return null }
      setRemarks('')
      return record._rowKey
    })
  }

  const handleApprove = async () => {
    if (!selectedRecord) return
    try {
      await api.post('/overtime/approval', {
        overtimeRequestId: selectedRecord.overtimeRequestId,
        action: 'Approved',
        remarks,
      })
      setRecords(prev =>
        prev.map(r => r._rowKey === selectedRecord._rowKey ? { ...r, otStatus: 'Approved' } : r)
      )
      setSelectedId(null)
      setRemarks('')
    } catch (err) {
      console.error('Failed to approve OT request:', err)
    }
  }

  const handleReject = async () => {
    if (!selectedRecord) return
    try {
      await api.post('/overtime/approval', {
        overtimeRequestId: selectedRecord.overtimeRequestId,
        action: 'Rejected',
        remarks,
      })
      setRecords(prev =>
        prev.map(r => r._rowKey === selectedRecord._rowKey ? { ...r, otStatus: 'Rejected' } : r)
      )
      setSelectedId(null)
      setRemarks('')
    } catch (err) {
      console.error('Failed to reject OT request:', err)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}>

        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose} />

        <motion.div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100" onClick={() => setSelectedId(null)}>
            <div className="flex items-center gap-2 text-gray-700">
              <MdMoreTime size={20} className="text-orange-500" />
              <span className="text-sm font-semibold tracking-wide uppercase">OT Requests</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors">
              <MdClose size={20} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-y-auto max-h-[60vh]">

            {loading && (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <MdRefresh size={24} className="animate-spin mr-2" />
                <span className="text-sm">Loading OT requests...</span>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center justify-center py-16 text-red-400">
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!loading && !error && records.length === 0 && (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <span className="text-sm">No overtime requests found</span>
              </div>
            )}

            {!loading && records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">Employee ID</th>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Requested Hours</th>
                      <th className="px-5 py-3 text-left">Reason</th>
                      <th className="px-5 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((record) => {
                      const isSelected = record._rowKey === selectedId
                      return (
                        <tr
                          key={record._rowKey}
                          onClick={() => canApprove && handleRowClick(record)}
                          className={
                            'transition-colors duration-100 border-l-4 ' +
                            (canApprove ? 'cursor-pointer select-none ' : 'cursor-default ') +
                            (isSelected ? 'bg-blue-50 border-l-blue-500' : 'hover:bg-gray-50 border-l-transparent')
                          }>
                          <td className="px-5 py-3 font-mono text-gray-500 text-xs">
                            #{record.employeeId}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric'
                            })}
                          </td>
                          <td className="px-5 py-3 font-mono text-gray-600">
                            {record.requestedHours} hrs
                          </td>
                          <td className="px-5 py-3 text-gray-600 max-w-[200px] break-words">
                            {record.reason || '--'}
                          </td>
                          <td className="px-5 py-3">
                            <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + (STATUS_STYLES[record.otStatus] || STATUS_STYLES['Pending'])}>
                              {record.otStatus}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center" onClick={() => setSelectedId(null)}>
            <span className="text-xs text-gray-400">
              {records.length} request{records.length !== 1 ? 's' : ''} found
            </span>
            {selectedRecord && (
              <span className="text-xs text-blue-500 font-medium">
                Selected: #{selectedRecord.employeeId}
              </span>
            )}
          </div>

          {/* Extension Panel */}
          <motion.div
            initial={false}
            animate={{ height: selectedRecord ? 'auto' : 0, opacity: selectedRecord ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50">
            <div className="px-6 py-4">
              {selectedRecord && !canActOnRecord && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700 font-medium">
                  You cannot approve or reject your own OT request.
                </div>
              )}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add a remark before approving or rejecting..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-700 placeholder-gray-300"
              />
              {canApprove && (
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    disabled={!selectedRecord || !['Pending','pending'].includes(selectedRecord.otStatus) || !remarks.trim() || !canActOnRecord}
                    onClick={handleApprove}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    Approve
                  </button>
                  <button
                    disabled={!selectedRecord || !['Pending','pending'].includes(selectedRecord.otStatus) || !remarks.trim() || !canActOnRecord}
                    onClick={handleReject}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}