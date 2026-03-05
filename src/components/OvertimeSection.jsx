import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MdCheckCircle } from 'react-icons/md'
import api from '../api/auth'
import { OTClockInButton, OTClockOutButton } from './OvertimeFunction'
import RotatingText from './RotatingText'

const showError = (setterFn, message) => {
  setterFn(message)
  setTimeout(() => setterFn(""), 5000)
}
export const OvertimeSection = ({ show, onSubmit, onDismiss, onFiled, onComplete }) => {
  const [otHours, setOtHours]               = useState("")
  const [otReason, setOtReason]             = useState("")
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState("")
  const [submitted, setSubmitted]           = useState(false)
  const [otTimeInEmpty, setOtTimeInEmpty]   = useState(false)
  const [otClockedIn, setOtClockedIn]       = useState(false)
  const [otTimeOutEmpty, setOtTimeOutEmpty] = useState(false)
  const [otCompleted, setOtCompleted]       = useState(false)

  const checkOTStatus = async () => {
    try {
      const response = await api.get('/timerecord/history-ot-logs')
      const records = response.data.records
      const today = new Date().toDateString()
      const todayOT = records.find(r =>
        new Date(r.date).toDateString() === today
      )
      if (todayOT && todayOT.otStatus !== null) {
        setSubmitted(true)
        onFiled?.()

        if (!todayOT.otTimeIn) {
          setOtTimeInEmpty(true)
          setOtClockedIn(false)
          setOtTimeOutEmpty(false)
          setOtCompleted(false)
        } else if (todayOT.otTimeIn && !todayOT.otTimeOut) {
          setOtTimeInEmpty(false)
          setOtClockedIn(true)
          setOtTimeOutEmpty(true)
          setOtCompleted(false)
        } else if (todayOT.otTimeIn && todayOT.otTimeOut) {
          setOtTimeInEmpty(false)
          setOtClockedIn(false)
          setOtTimeOutEmpty(false)
          setOtCompleted(true)
          setTimeout(() => {
          setOtCompleted(false)
          setSubmitted(false)
          onComplete?.()
          }, 5000)
        }
      }
    } catch (err) {
      console.log('Could not check OT status:', err)
    }
  }

  useEffect(() => { checkOTStatus() }, [])

  const handleSubmit = async () => {
    if (!otHours || !otReason) {
      showError(setError, "Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      await api.post('/overtime/submit', {
        requestedHours: parseFloat(otHours),
        reason: otReason,
      })
      onSubmit({ otHours, otReason })
      await checkOTStatus()
    } catch (err) {
      showError(setError, err.response?.data?.message || "Failed to file overtime. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden">
          <div className="mx-5 mb-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-4">

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-4 gap-2">

                {otCompleted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg text-blue-500 font-bold">
                    Overtime Finished
                  </motion.p>
                )}

                {otClockedIn && !otCompleted && (
                  <div className="flex items-center gap-0.5">
                    <p className="text-sm text-blue-700 tracking-wide font-bold text-[1rem]">
                      Overtime
                    </p>
                    <RotatingText
                    texts={['Start', 'Build', 'Code', 'Debug', 'Patch', 'Push', 'Grind']}
                    mainClassName="px-0.5 sm:px-0.5 md:px-1 bg-blue-500 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg font-bold"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}/>
                </div>
                )}

                {!otClockedIn && !otCompleted &&(
                  <>
                    <MdCheckCircle size={36} className="text-blue-500" />
                    <p className="text-sm font-semibold text-blue-600">Overtime successfully filed!</p>
                    <p className="text-xs text-gray-400">Your request is now pending approval.</p>
                  </>
                )}

                {otTimeInEmpty && !otClockedIn && !otCompleted && (
                  <OTClockInButton
                    onSuccess={async () => await checkOTStatus()}
                  />
                )}

                {otClockedIn && otTimeOutEmpty && !otCompleted && (
                  <OTClockOutButton
                    onSuccess={async () => await checkOTStatus()}
                  />
                )}

              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                    File Overtime?
                  </span>
                </div>

                <div className="mb-3 text-left">
                  <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1 block">
                    Number of Hours
                  </label>
                  <input
                    type="number" min="0.5" max="12" step="0.5" placeholder="e.g. 2"
                    value={otHours}
                    onChange={(e) => setOtHours(e.target.value)}
                    className="w-full rounded-lg border-2 border-blue-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  />
                </div>

                <div className="mb-4 text-left">
                  <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1 block">
                    Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter reason for overtime..."
                    value={otReason}
                    onChange={(e) => setOtReason(e.target.value)}
                    className="w-full rounded-lg border-2 border-blue-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center mb-3 animate-pulse">⚠ {error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 text-sm transition-colors duration-200 shadow-md">
                  {loading ? "Filing..." : "File Overtime"}
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}