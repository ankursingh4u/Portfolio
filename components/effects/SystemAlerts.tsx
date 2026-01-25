'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const alerts = [
  { type: 'success', message: 'SYSTEM OPERATIONAL' },
  { type: 'info', message: 'SCANNING NETWORK...' },
  { type: 'warning', message: 'FIREWALL ACTIVE' },
  { type: 'success', message: 'ENCRYPTION ENABLED' },
  { type: 'info', message: 'LOADING MODULES...' },
  { type: 'success', message: 'CONNECTION SECURE' },
  { type: 'warning', message: 'MONITORING ACTIVE' },
  { type: 'info', message: 'SYNCING DATA...' },
  { type: 'success', message: 'BACKUP COMPLETE' },
  { type: 'info', message: 'PROCESSING REQUEST' },
]

interface Alert {
  id: number
  type: string
  message: string
}

export function SystemAlerts() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])

  useEffect(() => {
    let id = 0

    const showAlert = () => {
      const alert = alerts[Math.floor(Math.random() * alerts.length)]
      const newAlert = { ...alert, id: id++ }

      setActiveAlerts((prev) => [...prev, newAlert])

      setTimeout(() => {
        setActiveAlerts((prev) => prev.filter((a) => a.id !== newAlert.id))
      }, 3000)
    }

    // Show first alert after 10 seconds
    const initialTimeout = setTimeout(showAlert, 10000)

    // Then show alerts randomly - less frequent
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        showAlert()
      }
    }, 15000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9990,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              background: 'rgba(17, 17, 19, 0.9)',
              border: `1px solid ${
                alert.type === 'success' ? 'rgba(34, 197, 94, 0.5)' :
                alert.type === 'warning' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(59, 130, 246, 0.5)'
              }`,
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: '10px',
              color: alert.type === 'success' ? 'rgba(34, 197, 94, 0.8)' :
                     alert.type === 'warning' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(59, 130, 246, 0.8)',
              boxShadow: `0 0 10px ${
                alert.type === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                alert.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'
              }`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              animation: 'pulse 1s infinite',
            }} />
            {'>'} {alert.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
