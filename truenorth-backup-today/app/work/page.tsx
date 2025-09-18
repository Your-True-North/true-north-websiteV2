'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import Link from 'next/link'

export default function Work() {
  const whatsappNumber = "+447449052909"
  
  const createWhatsAppLink = (message) => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{paddingTop: '5rem'}}>
          <div className="container">
            {/* Hero */}
            <div style={{textAlign: 'center', marginBottom: '5rem'}}>
              <h1 className="h1" style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                marginBottom: '1.5rem',
                color: '#ffffff'
              }}>
                Transform Your Pain Into Power
              </h1>
              <p className="body-large" style={{
                fontSize: '1.2rem',
                maxWidth: '700px',
                margin: '0 auto',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Deep healing through somatic therapy, breathwork, and energy work. 
                Where you are now does not have to be where you end up.
              </p>
            </div>

            {/* Individual Sessions */}
            <div style={{marginBottom: '5rem'}}>
              <div style={{textAlign: 'center', marginBottom: '4rem'}}>
                <h2 className="h2" style={{fontSize: '2.5rem', marginBottom: '1rem', color: '#ffffff'}}>
                  Individual Sessions
                </h2>
                <p className="body-large" style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem'}}>
                  Standalone experiences for targeted healing and breakthrough moments.
                </p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem'}}>
                {/* Breathwork */}
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  boxShadow: '0 6px 28px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 style={{fontSize: '1.8rem', marginBottom: '1rem', color: '#ffffff'}}>
                    Breathwork Journey
                  </h3>
                  <p style={{marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                    120 minutes of conscious connected breathing to release trapped emotions, trauma, and energy blocks.
                  </p>
                  <div style={{
                    fontSize: '2.5rem', 
                    fontWeight: '300', 
                    color: '#d4af37',
                    marginBottom: '2rem'
                  }}>
                    £200
                  </div>
                  <a 
                    href={createWhatsAppLink("Hi Mason, I'm interested in booking a Breathwork Journey session. Could you tell me more about availability?")}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4a261 100%)',
                      color: '#0a0a0b',
                      textDecoration: 'none',
                      fontWeight: '600',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}
                  >
                    Book Breathwork Journey
                  </a>
                </div>

                {/* Energy Healing */}
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  boxShadow: '0 6px 28px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 style={{fontSize: '1.8rem', marginBottom: '1rem', color: '#ffffff'}}>
                    Energy Healing Experience
                  </h3>
                  <p style={{marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)'}}>
                    60 minutes of Reiki Master level energy healing to clear blocks and restore natural flow.
                  </p>
                  <div style={{
                    fontSize: '2.5rem', 
                    fontWeight: '300', 
                    color: '#d4af37',
                    marginBottom: '2rem'
                  }}>
                    £120
                  </div>
                  <a 
                    href={createWhatsAppLink("Hi Mason, I'm interested in booking an Energy Healing Experience session. Could you tell me more about availability?")}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #d4af37 0%, #f4a261 100%)',
                      color: '#0a0a0b',
                      textDecoration: 'none',
                      fontWeight: '600',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}
                  >
                    Book Energy Healing
                  </a>
                </div>
              </div>

              {/* 3-Session Packages */}
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.04) 50%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '6px',
                marginBottom: '4rem'
              }}>
                <h3 style={{marginBottom: '2rem', color: '#ffffff', fontSize: '2rem'}}>
                  3-Session Packages - Mix & Match Any Combination
                </h3>
                <p style={{marginBottom: '2.5rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem'}}>
                  Choose any 3 sessions and save 15% automatically
                </p>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{color: '#d4af37', marginBottom: '1rem'}}>2 Breathwork + 1 Energy</h4>
                    <div style={{fontSize: '1.6rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                      <span style={{textDecoration: 'line-through', opacity: '0.6'}}>£520</span>
                      <span style={{color: '#d4af37', marginLeft: '0.5rem'}}>£442</span>
                    </div>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Save £78</p>
                  </div>
                  
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{color: '#d4af37', marginBottom: '1rem'}}>1 Breathwork + 2 Energy</h4>
                    <div style={{fontSize: '1.6rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                      <span style={{textDecoration: 'line-through', opacity: '0.6'}}>£440</span>
                      <span style={{color: '#d4af37', marginLeft: '0.5rem'}}>£374</span>
                    </div>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Save £66</p>
                  </div>
                  
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{color: '#d4af37', marginBottom: '1rem'}}>3 Breathwork Sessions</h4>
                    <div style={{fontSize: '1.6rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                      <span style={{textDecoration: 'line-through', opacity: '0.6'}}>£600</span>
                      <span style={{color: '#d4af37', marginLeft: '0.5rem'}}>£510</span>
                    </div>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Save £90</p>
                  </div>
                  
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{color: '#d4af37', marginBottom: '1rem'}}>3 Energy Healing Sessions</h4>
                    <div style={{fontSize: '1.6rem', fontWeight: '600', marginBottom: '0.5rem'}}>
                      <span style={{textDecoration: 'line-through', opacity: '0.6'}}>£360</span>
                      <span style={{color: '#d4af37', marginLeft: '0.5rem'}}>£306</span>
                    </div>
                    <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>Save £54</p>
                  </div>
                </div>

                <a 
                  href={createWhatsAppLink("Hi Mason, I'm interested in creating a custom 3-session package. I'd like to discuss which combination would work best for my healing journey and how the 15% discount applies.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #d4af37 0%, #f4a261 100