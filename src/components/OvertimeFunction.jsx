import { useState } from 'react'
import api from '../api/auth'

const showError = (setterFn, message) => {
  setterFn(message)
  setTimeout(() => setterFn(""), 5000)
}

export const OTClockInButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleOTClockIn = async () => {
    setLoading(true)
    try {
      const response = await api.post('/overtime/clock-in')
      onSuccess(response.data)
    } catch (err) {
      showError(setError, err.response?.data?.message || "OT Clock In failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOTClockIn}
        disabled={loading}
        className={`mt-2 w-full rounded-lg font-bold py-2.5 text-sm transition-colors duration-200 shadow-md
          ${loading
            ? 'bg-green-300 text-green-800 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}>
        {loading ? "..." : "Overtime Clock In"}
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center mt-1 animate-pulse">⚠ {error}</p>
      )}
    </>
  )
}

export const OTClockOutButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleOTClockOut = async () => {
    setLoading(true)
    try {
      const response = await api.post('/overtime/clock-out')
      onSuccess(response.data)
    } catch (err) {
      showError(setError, err.response?.data?.message || "OT Clock Out failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOTClockOut}
        disabled={loading}
        className={`mt-2 w-full rounded-lg font-bold py-2.5 text-sm transition-colors duration-200 shadow-md
          ${loading
            ? 'bg-red-300 text-red-800 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-500 text-white'
          }`}>
        {loading ? "..." : "Overtime Clock Out"}
      </button>
      {error && (
        <p className="text-red-500 text-xs text-center mt-1 animate-pulse">⚠ {error}</p>
      )}
    </>
  )
}