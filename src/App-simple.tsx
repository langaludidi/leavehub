import React from 'react'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '3rem',
        borderRadius: '1rem',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{color: '#333', marginBottom: '1rem'}}>🏢 LeaveHub</h1>
        <h2 style={{color: '#666', marginBottom: '2rem'}}>Leave Management System</h2>
        
        <div style={{marginBottom: '2rem'}}>
          <p style={{color: '#555', lineHeight: '1.6'}}>
            A comprehensive solution for managing employee leave requests, approvals, and tracking.
          </p>
        </div>

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <a 
            href="/signin" 
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            Sign In
          </a>
          <a 
            href="/signup"
            style={{
              background: '#2196F3',
              color: 'white',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            Sign Up
          </a>
        </div>

        <div style={{marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem'}}>
          <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>
            <strong>Status:</strong> React App Successfully Loaded ✅
          </p>
        </div>
      </div>
    </div>
  )
}

export default App