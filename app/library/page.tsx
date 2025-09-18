'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'

export default function Library() {
  const [showModal, setShowModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleResourceClick = (resourceName: string) => {
    setSelectedResource(resourceName)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/convertkit/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          tag: 'library-download',
          resource: selectedResource
        }),
      })
      
      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setShowModal(false)
          setSubmitted(false)
          setEmail('')
          setFirstName('')
        }, 3000)
      }
    } catch (error) {
      console.error('Subscription failed:', error)
    }
    
    setIsSubmitting(false)
  }

  const resources = [
    {
      title: "The Inner Fire Method",
      description: "Transform anger into purposeful energy through ancient breathwork techniques.",
      type: "PDF Guide"
    },
    {
      title: "Body Memory Release",
      description: "Somatic practices to release trauma stored in your body's cellular memory.",
      type: "Audio Practice"
    },
    {
      title: "Sacred Masculine Awakening",
      description: "Reclaim your authentic masculine power without toxic patterns.",
      type: "Video Series"
    },
    {
      title: "Energy Clearing Ritual",
      description: "Clear ancestral patterns and energetic blocks holding you back.",
      type: "Guided Practice"
    },
    {
      title: "Truth Speaking Framework",
      description: "Find your voice and speak your truth with compassionate strength.",
      type: "Worksheet"
    },
    {
      title: "Integration Journal",
      description: "Track your transformation journey with guided reflection prompts.",
      type: "PDF Template"
    }
  ]

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{paddingTop: '6rem'}}>
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h1 className="h1 shimmer-accent" style={{fontSize: '2.5rem'}}>
                Free Resource Library
              </h1>
              <p className="body-large" style={{fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto'}}>
                Tools for your transformation journey. Each resource is designed to support your return to authentic power.
              </p>
            </div>

            <div className="resources-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
              {resources.map((resource, index) => (
                <div key={index} className="card" style={{cursor: 'pointer'}} onClick={() => handleResourceClick(resource.title)}>
                  <div style={{marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}} className="body-small accent-text">
                    {resource.type}
                  </div>
                  <h3 className="h3 shimmer-accent" style={{fontSize: '1.4rem', marginBottom: '1rem'}}>
                    {resource.title}
                  </h3>
                  <p className="body" style={{fontSize: '0.95rem', marginBottom: '1.5rem'}}>
                    {resource.description}
                  </p>
                  <div className="btn-secondary" style={{borderRadius: '0.3rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'inline-block'}}>
                    Access Resource →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Email Capture Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(123, 166, 155, 0.3)'
          }}>
            {!submitted ? (
              <>
                <h3 style={{color: '#9bc4b8', marginBottom: '1rem', fontSize: '1.5rem'}}>
                  Access: {selectedResource}
                </h3>
                <p style={{marginBottom: '2rem', color: '#f6f6f6'}}>
                  Enter your details to receive this resource and join our community of men committed to authentic transformation.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      marginBottom: '1rem',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid rgba(123, 166, 155, 0.3)',
                      borderRadius: '0.3rem',
                      color: '#f6f6f6',
                      fontSize: '1rem'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  
                  <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(123, 166, 155, 0.5)',
                        borderRadius: '0.3rem',
                        color: '#9bc4b8',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: '#9bc4b8',
                        border: 'none',
                        borderRadius: '0.3rem',
                        color: '#0a0a0b',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Get Resource'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{textAlign: 'center'}}>
                <h3 style={{color: '#9bc4b8', marginBottom: '1rem'}}>Welcome to the Journey</h3>
                <p style={{color: '#f6f6f6', marginBottom: '1rem'}}>
                  Check your email for your resource and welcome sequence.
                </p>
                <div style={{color: '#9bc4b8', fontSize: '2rem'}}>✓</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </>
  )
}
