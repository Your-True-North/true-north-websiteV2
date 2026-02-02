'use client'

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem'
        }}>
          🔧
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#9bc4b8'
        }}>
          Brief Maintenance
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          We're making some improvements to enhance your experience.
          <br />
          The Circle will be back shortly.
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Expected time: Up to 24 hours
        </p>
      </div>
    </div>
  )
}
