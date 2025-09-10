import React from 'react'
import { Link } from 'react-router-dom'

interface StatCard {
  name: string
  stat: string
  previousStat: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  href?: string
  onClick?: () => void
}

const defaultStats: StatCard[] = [
  {
    name: 'Leave Balance',
    stat: '18.5 days',
    previousStat: '21 days',
    change: '2.5 days used',
    changeType: 'decrease',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    href: '/employee/leave'
  },
  {
    name: 'Documents',
    stat: '4 new',
    previousStat: '2 new',
    change: '2 added',
    changeType: 'increase',
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    name: 'Pending Requests',
    stat: '2',
    previousStat: '1',
    change: '1 new',
    changeType: 'increase',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/employee/leave'
  },
  {
    name: 'Team Capacity',
    stat: '87%',
    previousStat: '92%',
    change: '5% decrease',
    changeType: 'decrease',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/employee/calendar'
  },
  {
    name: 'This Month',
    stat: '3 days',
    previousStat: '5 days',
    change: '2 days less',
    changeType: 'increase',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  }
]

interface DashboardStatsProps {
  stats?: StatCard[]
  role?: string
  onDocumentClick?: () => void
  onNewHiresClick?: () => void
  onNewRequestsClick?: () => void
  onAvgResponseTimeClick?: () => void
}

export function DashboardStats({ stats = defaultStats, role = 'employee', onDocumentClick, onNewHiresClick, onNewRequestsClick, onAvgResponseTimeClick }: DashboardStatsProps) {
  const getAdminStats = (): StatCard[] => [
    {
      name: 'Total Employees',
      stat: '847',
      previousStat: '832',
      change: '15 new hires',
      changeType: 'increase',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 0 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: onNewHiresClick,
      href: '/admin/employees'
    },
    {
      name: 'Pending Approvals',
      stat: '24',
      previousStat: '18',
      change: '6 new requests',
      changeType: 'increase',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: onNewRequestsClick,
      href: '/admin/leave'
    },
    {
      name: 'Avg. Response Time',
      stat: '2.3 hours',
      previousStat: '3.1 hours',
      change: '26% faster',
      changeType: 'increase',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      onClick: onAvgResponseTimeClick,
      href: '/admin/reports'
    },
    {
      name: 'Department Budget',
      stat: 'R2.4M',
      previousStat: 'R2.1M',
      change: 'R300K allocated',
      changeType: 'increase',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: '/admin/reports'
    }
  ]

  const currentStats = role === 'admin' ? getAdminStats() : stats.map(stat => {
    // Add onClick handler to Documents card
    if (stat.name === 'Documents' && onDocumentClick) {
      return { ...stat, onClick: onDocumentClick }
    }
    return stat
  })

  const renderCards = () => {
    const count = currentStats.length
    
    if (count === 5) {
      // Special layout for 5 cards: 3 on top row, 2 on bottom row (centered)
      return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Top row - 3 cards */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {currentStats.slice(0, 3).map((item) => renderCard(item))}
          </div>
          {/* Bottom row - 2 cards centered with enhanced spacing */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 max-w-2xl w-full px-4 sm:px-0">
              {currentStats.slice(3, 5).map((item) => renderCard(item))}
            </div>
          </div>
        </div>
      )
    }
    
    // Standard grid layout for other counts
    const getGridClass = () => {
      if (count <= 2) return "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2"
      if (count === 3) return "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3"
      if (count === 4) return "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4"
      return "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }
    
    return (
      <div className={getGridClass()}>
        {currentStats.map((item) => renderCard(item))}
      </div>
    )
  }

  const renderCard = (item: StatCard) => {
    const cardContent = (
      <>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 opacity-60"></div>
        
        {/* Content */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${item.color} rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-200`}>
              <div className="w-4 h-4 sm:w-5 sm:h-5">
                {item.icon}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.changeType === 'increase' ? '↗' : '↘'}</div>
              <div className={`text-xs sm:text-sm font-bold ${
                item.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>{item.change}</div>
            </div>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{item.name}</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl heading-premium text-gray-900 dark:text-gray-100 font-bold">{item.stat}</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                item.changeType === 'increase' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {item.changeType === 'increase' ? '↗' : '↘'} <span className="hidden sm:inline">{item.change}</span><span className="sm:hidden">{item.change.split(' ')[0]}</span>
              </span>
            </div>
          </div>
        </div>
      </>
    );

    if (item.href) {
      return (
        <Link 
          key={item.name}
          to={item.href}
          className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700/50 backdrop-blur-sm"
        >
          {cardContent}
        </Link>
      );
    } else if (item.onClick) {
      return (
        <button 
          key={item.name}
          onClick={item.onClick}
          className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700/50 text-left w-full backdrop-blur-sm"
        >
          {cardContent}
        </button>
      );
    } else {
      return (
        <div 
          key={item.name}
          className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-102 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
        >
          {cardContent}
        </div>
      );
    }
  }

  return renderCards()
}