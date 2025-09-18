'use client'

import { useState } from 'react'

export default function CorCheckout() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleCheckout = async () => {
    if (!email) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          priceId: 'price_1S0gabLEGgnmE0KKGnWlJuWN'
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      padding: '2rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(123, 166, 155, 0.3)',
      maxWidth: '400px',
      margin: '2rem auto'
    }}>
      <h3 style={{color: '#9bc4b8', marginBottom: '1rem'}}>Join The CoR</h3>
      <p style={{color: '#f6f6f6', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
        Monthly group sessions for men committed to authentic transformation. £50/month.
      </p>
      
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '0.8rem',
          marginBottom: '1.5rem',
          backgroundColor: '#2a2a2a',
          border: '1px solid rgba(123, 166, 155, 0.3)',
          borderRadius: '0.3rem',
          color: '#f6f6f6',
          fontSize: '1rem'
        }}
      />
      
      <button
        onClick={handleCheckout}
        disabled={loading || !email}
        style={{
          width: '100%',
          padding: '0.8rem',
          backgroundColor: loading ? '#666' : '#9bc4b8',
          color: '#0a0a0b',
          border: 'none',
          borderRadius: '0.3rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        {loading ? 'Processing...' : 'Start Membership - £50/month'}
      </button>
    </div>
  )
}
