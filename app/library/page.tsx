'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import MysticalBackground from '../components/MysticalBackground'

export default function Library() {
  const [showModal, setShowModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleResourceClick = (resourceName) => {
    setSelectedResource(resourceName)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
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
          setSelectedResource('')
        }, 3000)
      } else {
        console.error('Subscription failed')
      }
    } catch (error) {
      console.error('Subscription failed:', error)
    }
    
    setIsSubmitting(false)
  }

  const resources = [
    {
      title: "Realistic Anger Management",
      description: "Five simple actions to minimise your anger response",
      type: "PDF Guide"
    },
    {
      title: "The Space Method",
      description: "Break old patterns in 14 days by shifting the way you see, feel, and move through life.",
      type: "Video Series"
    },
    {
      title: "Take Back Control",
      description: "A two-week course to help you release anger without guilt, shame, or shutting yourself down.",
      type: "Video Series"
    },
    {
      title: "A Mans Guide to Knowing Himself",
      description: "The knowledge every man must have if he wants to lead himself and his life.",
      type: "Ebook"
    },
    {
      title: "Integration Journal",
      description: "Track your transformation with clear prompts to support reflection, processing, and growth.",
      type: "PDF Template"
    },
    {
      title: "Awaken The Truth",
      description: "A 5-minute mind-body audio to help ignite and empower as you start your day.",
      type: "Audio Practice"
    }
  ]

  const comingSoonResources = Array(6).fill(null).map((_, index) => ({
    title: "More Resources Coming Soon",
    description: "Additional tools and practices are being crafted to support your transformation journey.",
    type: "Coming Soon",
    isComingSoon: true
  }))

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{paddingTop: '6rem', paddingBottom: '4rem'}}>
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                Free Resource Library
              </h1>
              <p style={{
                fontSize: '1.1rem', 
                maxWidth: '600px', 
                margin: '0 auto',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.6'
              }}>
                Tools for your transformation journey. Each resource is designed to support your return to authentic power.
              </p>
            </div>

            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {resources.map((resource, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleResourceClick(resource.title)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    marginBottom: '1rem', 
                    fontSize: '0.8rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {resource.type}
                  </div>
                  <h3 style={{
                    fontSize: '1.4rem', 
                    marginBottom: '1rem',
                    color: '#ffffff',
                    fontWeight: '600'
                  }}>
                    {resource.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem', 
                    marginBottom: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>
                  <div style={{
                    borderRadius: '6px', 
                    padding: '0.6rem 1.2rem', 
                    fontSize: '0.9rem', 
                    display: 'inline-block',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}>
                    Access Resource →
                  </div>
                </div>
              ))}
              
              {comingSoonResources.map((resource, index) => (
                <div 
                  key={`coming-soon-${index}`} 
                  style={{
                    padding: '2rem',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    opacity: 0.6,
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    marginBottom: '1rem', 
                    fontSize: '0.8rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {resource.type}
                  </div>
                  <h3 style={{
                    fontSize: '1.4rem', 
                    marginBottom: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600'
                  }}>
                    {resource.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem', 
                    marginBottom: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>
                  <div style={{
                    borderRadius: '6px', 
                    padding: '0.6rem 1.2rem', 
                    fontSize: '0.9rem', 
                    display: 'inline-block',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    Coming Soon
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
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            padding: '2.5rem',
            borderRadius: '6px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            {!submitted ? (
              <>
                <h3 style={{
                  color: '#ffffff', 
                  marginBottom: '0.5rem', 
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}>
                  Access: {selectedResource}
                </h3>
                <p style={{
                  marginBottom: '2rem', 
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.6'
                }}>
                  Enter your details to receive this resource and join our community committed to authentic transformation.
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
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  />
                  
                  <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: isSubmitting ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000000',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = '#ffffff'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Get Resource'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{textAlign: 'center'}}>
                <h3 style={{
                  color: '#ffffff', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem'
                }}>
                  Welcome to the Journey
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  Check your email for your resource and welcome sequence.
                </p>
                <div style={{
                  color: '#4ade80', 
                  fontSize: '2.5rem',
                  marginBottom: '1rem'
                }}>
                  ✓
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}