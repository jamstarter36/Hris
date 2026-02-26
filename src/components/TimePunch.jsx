    import { AnimatePresence, motion } from 'framer-motion'
    import { useState, useEffect } from 'react'
    import { useAuth } from '../context/AuthStorage'
    import { clockIn, clockOut } from '../api/auth'
    import { MdAccessTime, MdClose } from 'react-icons/md'
    import api from '../api/auth'

    export const TimePunch = () => {
    const { user } = useAuth()

    const [clockOpen, setClockOpen]       = useState(false)
    const [time, setTime]                 = useState(new Date())
    const [clockedIn, setClockedIn]       = useState(() => sessionStorage.getItem(`clockedIn_${user?.id}`) === "true")
    const [timeRecordId, setTimeRecordId] = useState(() => sessionStorage.getItem(`timeRecordId_${user?.id}`) || null)
    const [timeIn, setTimeIn]             = useState(() => sessionStorage.getItem(`timeIn_${user?.id}`) || null)
    const [timeOut, setTimeOut]           = useState(() => sessionStorage.getItem(`timeOut_${user?.id}`) || null)
    const [clockLoading, setClockLoading] = useState(false)
    const [clockError, setClockError]     = useState("")
    const [showOT, setShowOT]             = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const checkClockStatus = async () => {
        try {
            const response = await api.get('/timerecord/history')
            const records = response.data.records
            const today = new Date().toDateString()
            const todayRecord = records.find(r =>
            new Date(r.date).toDateString() === today
            )

            if (todayRecord && todayRecord.timeIn && !todayRecord.timeOut) {
            sessionStorage.setItem(`clockedIn_${user.id}`, 'true')
            sessionStorage.setItem(`timeIn_${user.id}`, todayRecord.timeIn)
            setClockedIn(true)
            setTimeIn(todayRecord.timeIn)
            setShowOT(false)
            } else if (todayRecord && todayRecord.timeIn && todayRecord.timeOut) {
            sessionStorage.setItem(`timeOut_${user.id}`, todayRecord.timeOut)
            setTimeOut(todayRecord.timeOut)
            setClockedIn(false)
            setShowOT(true)
            } else {
            setClockedIn(false)
            setTimeIn(null)
            setTimeOut(null)
            setShowOT(false)
            }
        } catch (err) {
            console.log('Could not check clock status:', err)
        }
        }
        checkClockStatus()
    }, [])

    const hours12 = String(time.getHours() % 12 || 12).padStart(2, '0')
    const minutes = String(time.getMinutes()).padStart(2, '0')
    const seconds = String(time.getSeconds()).padStart(2, '0')
    const ampm    = time.getHours() >= 12 ? 'PM' : 'AM'
    const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const handleClockIn = async () => {
        setClockLoading(true)
        setClockError("")
        try {
        const data = await clockIn()
        sessionStorage.setItem(`clockedIn_${user.id}`, "true")
        sessionStorage.setItem(`timeRecordId_${user.id}`, data.timeRecordId)
        sessionStorage.setItem(`timeIn_${user.id}`, data.timeIn)
        sessionStorage.removeItem(`timeOut_${user.id}`)
        setClockedIn(true)
        setTimeRecordId(data.timeRecordId)
        setTimeIn(data.timeIn)
        setTimeOut(null)
        setShowOT(false)
        } catch (err) {
        setClockError(err.response?.data?.error || "Clock in failed. Try again.")
        } finally {
        setClockLoading(false)
        }
    }

    const handleClockOut = async () => {
        setClockLoading(true)
        setClockError("")
        try {
        const data = await clockOut(timeRecordId)
        sessionStorage.removeItem(`clockedIn_${user.id}`)
        sessionStorage.removeItem(`timeRecordId_${user.id}`)
        sessionStorage.removeItem(`timeIn_${user.id}`)
        sessionStorage.setItem(`timeOut_${user.id}`, data.timeOut)
        setClockedIn(false)
        setTimeRecordId(null)
        setTimeIn(null)
        setTimeOut(data.timeOut)
        setShowOT(true)
        } catch (err) {
        setClockError(err.response?.data?.error || "Clock out failed. Try again.")
        } finally {
        setClockLoading(false)
        }
    }

    if (user?.role === 'Admin') return null

    return (
        <>
        <button
            onClick={() => setClockOpen(true)}
            className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 bg-[#0f172a] p-2 lg:p-3 rounded-full shadow-lg text-white hover:bg-blue-700 transition-colors duration-200">
            <MdAccessTime size={20} className="lg:hidden" />
            <MdAccessTime size={28} className="hidden lg:block" />
        </button>
        <AnimatePresence>
            {clockOpen && (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setClockOpen(false)}/>

                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md text-center overflow-hidden">

                    <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700">
                        <MdAccessTime size={20} />
                        <span className="text-sm font-semibold tracking-wide uppercase">WEB CLOCKING</span>
                    </div>
                    <button
                        onClick={() => setClockOpen(false)}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors">
                        <MdClose size={20} />
                    </button>
                    </div>

                    <motion.div
                    className="relative bg-white rounded-xl w-full text-center overflow-hidden"
                    initial={{ opacity: 0, scale: 0.85, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 40 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}>

                    <div className="bg-[#0f172a] mx-6 mt-6 mb-4 rounded-xl py-8 px-4">
                        <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight">{hours12}</span>
                            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Hour</span>
                        </div>
                        <span className="text-3xl sm:text-4xl font-bold text-blue-400 font-mono animate-pulse pb-4">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider">{minutes}</span>
                            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Min</span>
                        </div>
                        <span className="text-3xl sm:text-4xl font-bold text-blue-400 font-mono animate-pulse pb-4">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider">{seconds}</span>
                            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Sec</span>
                        </div>
                        <div className="flex flex-col items-center pb-4">
                            <span className="text-lg font-bold text-blue-400">{ampm}</span>
                        </div>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-gray-500 mb-2 px-6">{dateStr}</p>
                    {clockedIn && timeIn && (
                        <p className="text-xs text-center text-gray-400 px-6 pb-2">
                        Clocked in at{" "}
                        <span className="font-mono font-bold text-gray-700">
                            {new Date(timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        </p>
                    )}

                    {!clockedIn && timeOut && (
                        <p className="text-xs text-center text-gray-400 px-6 pb-2">
                        Clocked out at{" "}
                        <span className="font-mono font-bold text-gray-700">
                            {new Date(timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="px-1">on</span>
                        <span className="font-mono font-bold text-gray-700">
                            {new Date(timeOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        </p>
                    )}

                    {clockError && (
                        <p className="text-red-500 text-xs text-center px-6 pb-2 animate-pulse">
                        ⚠ {clockError}
                        </p>
                    )}
                    <div className="border-t-2 border-gray-100 pt-4 pb-4 flex gap-2 justify-center items-center px-5">
                        <button
                        onClick={handleClockIn}
                        disabled={clockedIn || clockLoading}
                        className={`rounded-lg shadow-md py-3 font-bold text-sm whitespace-nowrap transition-colors duration-200 w-36
                            ${clockedIn || clockLoading
                            ? 'bg-green-300 text-green-800 cursor-not-allowed'
                            : 'bg-green-700 text-white hover:bg-green-500'
                            }`}>
                        {clockLoading && !clockedIn ? "..." : clockedIn ? "You're Clocked In" : "Clock In"}
                        </button>
                        <button
                        onClick={handleClockOut}
                        disabled={!clockedIn || clockLoading}
                        className={`rounded-lg shadow-md py-3 font-bold text-sm whitespace-nowrap transition-colors duration-200 w-36
                            ${!clockedIn || clockLoading
                            ? 'bg-red-300 text-red-800 cursor-not-allowed'
                            : 'bg-red-700 text-white hover:bg-red-500'
                            }`}>
                        {clockLoading && clockedIn ? "..." : "Clock Out"}
                        </button>
                    </div>
                    <AnimatePresence>
                    {showOT && (
                        <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden">
                        <div className="mx-5 mb-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-4">
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
                            <input type="number" min="0.5" max="12" step="0.5" placeholder="e.g. 2"
                                className="w-full rounded-lg border-2 border-blue-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"/>
                            </div>
                            <div className="mb-4 text-left">
                            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1 block">
                                Reason
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Enter reason for overtime..."
                                className="w-full rounded-lg border-2 border-blue-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none"/>
                            </div>
                            <button
                            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-sm transition-colors duration-200 shadow-md">
                            File OT
                            </button>

                        </div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    </motion.div>
                </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
        </>
    )
    }