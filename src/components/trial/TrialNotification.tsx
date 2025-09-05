import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLocalTrialStatus, trialManager } from '../../lib/trialManager'

interface TrialInfo {
  isTrialActive: boolean
  daysRemaining: number
  trialEndDate: string
  hasNotificationBeenShown: boolean
}

export function TrialNotification() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check trial status using the trial manager
    const checkTrialStatus = () => {
      const localStatus = getLocalTrialStatus()
      const trialDismissed = localStorage.getItem('trialNotificationDismissed')
      
      if (localStatus.isActive && !trialDismissed) {
        const endDate = new Date(new Date(localStatus.startDate!).getTime() + (14 * 24 * 60 * 60 * 1000))
        
        setTrialInfo({
          isTrialActive: true,
          daysRemaining: localStatus.daysRemaining,
          trialEndDate: endDate.toLocaleDateString(),
          hasNotificationBeenShown: false
        })
        
        // Show notification for last 7 days of trial
        if (localStatus.daysRemaining <= 7) {
          setShowNotification(true)
        }
      } else if (!localStatus.isActive && localStatus.startDate) {
        // Trial has expired
        setTrialInfo({
          isTrialActive: false,
          daysRemaining: 0,
          trialEndDate: '',
          hasNotificationBeenShown: false
        })
        setShowNotification(false)
      }
    }

    checkTrialStatus()
    
    // Check every hour
    const interval = setInterval(checkTrialStatus, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    setShowNotification(false)
    localStorage.setItem('trialNotificationDismissed', 'true')
  }

  const handleUpgradeClick = () => {
    // Track upgrade click
    console.log('Trial upgrade clicked')
  }

  if (!trialInfo || !showNotification || dismissed) {
    return null
  }

  const getNotificationStyle = () => {
    if (trialInfo.daysRemaining <= 2) {
      return 'bg-red-50 border-red-200 text-red-800'
    } else if (trialInfo.daysRemaining <= 7) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIcon = () => {
    if (trialInfo.daysRemaining <= 2) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const getTitle = () => {
    if (trialInfo.daysRemaining === 1) {
      return 'Your trial expires tomorrow!'
    } else if (trialInfo.daysRemaining <= 2) {
      return `Your trial expires in ${trialInfo.daysRemaining} days!`
    } else {
      return `${trialInfo.daysRemaining} days left in your trial`
    }
  }

  const getMessage = () => {
    if (trialInfo.daysRemaining <= 2) {
      return 'Upgrade now to continue using all LeaveHub features without interruption.'
    } else {
      return 'Upgrade to continue enjoying all premium features after your trial ends.'
    }
  }

  return (
    <>
      {/* Desktop Notification */}
      <div className={`hidden md:block fixed top-4 right-4 max-w-sm z-50 ${getNotificationStyle()} border rounded-lg p-4 shadow-lg`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold">{getTitle()}</h3>
            <p className="text-xs mt-1 opacity-90">{getMessage()}</p>
            <div className="mt-3 flex space-x-2">
              <Link
                to="/billing"
                onClick={handleUpgradeClick}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Upgrade Now
              </Link>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Notification - Banner Style */}
      <div className={`md:hidden ${getNotificationStyle()} border-b px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{getTitle()}</p>
              <p className="text-xs opacity-90">{getMessage()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <Link
              to="/billing"
              onClick={handleUpgradeClick}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Upgrade
            </Link>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Trial status hook
export function useTrialStatus() {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)

  useEffect(() => {
    const checkTrialStatus = () => {
      const localStatus = getLocalTrialStatus()
      
      if (localStatus.startDate) {
        const endDate = new Date(new Date(localStatus.startDate).getTime() + (14 * 24 * 60 * 60 * 1000))
        
        setTrialInfo({
          isTrialActive: localStatus.isActive,
          daysRemaining: Math.max(0, localStatus.daysRemaining),
          trialEndDate: endDate.toLocaleDateString(),
          hasNotificationBeenShown: false
        })
      }
    }

    checkTrialStatus()
    const interval = setInterval(checkTrialStatus, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const startTrial = () => {
    trialManager.startLocalTrial()
    // Trigger re-check
    window.location.reload()
  }

  const endTrial = () => {
    trialManager.clearLocalTrial()
    setTrialInfo(null)
  }

  return {
    trialInfo,
    startTrial,
    endTrial
  }
}