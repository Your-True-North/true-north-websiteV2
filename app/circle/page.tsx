'use client'
import { useState, useRef, useEffect } from 'react'
import Navigation from '../components/Navigation'
import './cosmic.css'

export default function Circle() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [pricingPlan, setPricingPlan] = useState('monthly')
  const [showVideoText, setShowVideoText] = useState(true)
  const [videoMuted, setVideoMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/convertkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          tags: ['THE_CoR_WAITLIST_TAG_ID'],
          formId: 'THE_ECO_SYSTEM_ID'
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVideoPlay = () => {
    setTimeout(() => {
      setShowVideoText(false);
    }, 2000);
  };

  const handleVideoClick = () => {
    setVideoMuted(false);
    setShowVideoText(false);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen()?.then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen()?.then(() => {
        setIsFullscreen(false)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  return (
    <>
      <Navigation />
      
      <section className="video-hero-responsive">
        <div className="video-hero-container">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              className="hero-video"
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              poster="/circle-video-poster.jpg"
              onPlay={handleVideoPlay}
              onClick={handleVideoClick}
              controls={false}
            >
              <source src="/circle-intro-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {showVideoText && (
              <div className="video-overlay">
                <div className="video-content">
                  <h1>Watch first</h1>
                  <p>Is this the beginning of your shift?</p>
                  {videoMuted && (
                    <p className="click-unmute">
                      Click to unmute
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="custom-video-controls">
              <button className="video-control-btn expand-btn" onClick={toggleFullscreen} title="Fullscreen">
                ⛶
              </button>
              <button className="video-control-btn" onClick={handlePlayPause}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="video-control-btn" onClick={handleRestart}>
                ⏮
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div className="cosmic-hero">
        <main className="page-container">
          <section className="section circle-content">
            <div className="container">
              
              <div className="intro-text">
                <div className="intro-content">
                  <p className="intro-paragraph">
                    You're not about to join a community. You're entering a portal for you to return to yourself. 
                    To return to your truth. To Source. To love. To embodiment. To now.
                  </p>
                  <p className="intro-italic">
                    You've built your current identity on societal expectations.
                  </p>
                  <p className="intro-paragraph">
                    However, there is a more fearless, confident, and powerful you underneath the pain of your wounds.
                  </p>
                  <p className="wisdom-quote">
                    Know this: There is wisdom in your wounds, purpose and power in your pain.
                  </p>
                </div>
              </div>

              <div className="pillars-section">
                <h2 className="section-title">
                  🜁 Pillars for The Circle of Return:
                </h2>
                
                <div className="pillars-weave">
                  <div className="pillar-weave">
                    <div className="pillar-visual">1</div>
                    <div className="pillar-content">
                      <h3 className="pillar-title">Healing Without Performing</h3>
                      <p className="pillar-description">No small talking. No pretending. Just truth.</p>
                    </div>
                  </div>

                  <div className="pillar-weave">
                    <div className="pillar-visual">2</div>
                    <div className="pillar-content">
                      <h3 className="pillar-title">Grounded Spirituality</h3>
                      <p className="pillar-description">Oneness, return to source, find inner-peace.</p>
                    </div>
                  </div>

                  <div className="pillar-weave">
                    <div className="pillar-visual">3</div>
                    <div className="pillar-content">
                      <h3 className="pillar-title">Masculine-Led Container</h3>
                      <p className="pillar-description">Strong edges, soft centre.</p>
                    </div>
                  </div>

                  <div className="pillar-weave">
                    <div className="pillar-visual">4</div>
                    <div className="pillar-content">
                      <h3 className="pillar-title">Somatic Rewiring</h3>
                      <p className="pillar-description">Feeling it. Releasing it. Discovering what's under it.</p>
                    </div>
                  </div>

                  <div className="pillar-weave">
                    <div className="pillar-visual">5</div>
                    <div className="pillar-content">
                      <h3 className="pillar-title">Devoted Growth</h3>
                      <p className="pillar-description">Not motivational hype, just soul-led accountability.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="whats-inside-section">
                <h2 className="section-title">
                  🜂 What's Inside the Circle of Return:
                </h2>
                
                <p className="section-subtitle">
                  This isn't content you'll forget in 48 hours. <strong>This is nervous system work, soul work, 
                  and real change from the inside out.</strong>
                </p>

                <div className="features-grid">
                  {[
                    "Weekly coaching prompts & self-reflection practices - To keep you anchored in truth, even when life tries to pull you out.",
                    "Live workshops & Q&As - For when the emotions get big, the questions get loud, and you need real-time guidance.",
                    "Proven emotional regulation tools - So you stop spiralling in stress and start moving from centre — clean, clear, grounded.",
                    "Monthly themes - To bring focus, rhythm, and depth to your growth — no more scattered self-help.",
                    "Supportive private community - Because healing in isolation isn't healing. This is your space to be witnessed, guided, and held.",
                    "Guest speakers & expert sessions - To expand your perspective, stretch your soul, and deepen your capacity."
                  ].map((feature, index) => (
                    <div key={index} className="premium-card feature-card">
                      <span className="feature-check">✔</span>
                      <p className="feature-text">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="who-for-section">
                <h2 className="section-title">
                  ⟁ Who This Is For -
                </h2>
                
                <div className="who-for-content">
                  <p className="who-for-intro">
                    This is for the person who knows deep down, there's more:
                  </p>
                  <div className="more-list">
                    <p>More peace.</p>
                    <p>More purpose.</p>
                    <p>More clarity.</p>
                    <p>More money.</p>
                    <p>More you…</p>
                  </div>
                  <p className="who-for-main">
                    And you're finally ready to stop circling the edge of your healing and walk into the centre of it.
                  </p>
                  <p className="who-for-conclusion">
                    Whether you're navigating anger, stress, self-sabotage, or just feeling lost — this is your space to return.
                  </p>
                </div>
              </div>

              <div className="premium-card pricing-section">
                <div className="pre-launch-badge">
                  Pre-Launch Offer - Limited Time Only
                </div>
                
                <h2 className="pricing-title">The Investment</h2>
                
                <div className="pricing-toggle">
                  <button 
                    className={`pricing-option ${pricingPlan === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPricingPlan('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`pricing-option ${pricingPlan === 'yearly' ? 'active' : ''}`}
                    onClick={() => setPricingPlan('yearly')}
                  >
                    Yearly (Save £150)
                  </button>
                </div>
                
                <div className="glow-price pricing-amount">
                  {pricingPlan === 'yearly' ? '£450' : '£50'}
                  <span className="pricing-period">
                    {pricingPlan === 'yearly' ? 'per year' : 'per month'}
                  </span>
                </div>
                
                <div className="post-launch-card">
                  <p className="post-launch-text">
                    Post-Launch: The Circle journey will be £800 per year
                  </p>
                </div>
                
                <div className="investment-description">
                  <p className="investment-gift">
                    This investment is a gift to yourself — an answer to your inner call for the shift you know needs to be made.
                  </p>
                  <p>You can cancel anytime. No pressure. No contracts. No tactics.</p>
                  <p>Just you, choosing to come home at your own pace, in your own time.</p>
                  <p className="investment-italic">When you're ready, the door opens. The Circle begins.</p>
                  <p className="investment-question">Will you answer to your inner-voice?</p>
                </div>

                {!isSubmitted ? (
                  <div className="waitlist-section">
                    <h3 className="waitlist-title">
                      ⊛ JOIN THE WAITLIST FOR THE CIRCLE OF RETURN
                    </h3>
                    <p className="waitlist-subtitle">
                      No pressure. Just support, structure, and real shifts.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="waitlist-form">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="waitlist-input"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="waitlist-button"
                      >
                        {isSubmitting ? 'Joining...' : 'Join The Circle'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="success-message">
                    <h3>Welcome to The Circle</h3>
                    <p>You'll receive updates as we prepare to launch in January 2025.</p>
                  </div>
                )}
                
                <p className="privacy-note">
                  I respect your privacy. Unsubscribe at any time.
                </p>
              </div>

              <div className="closing-section">
                <h2 className="brand-title">TRUE NORTH</h2>
                <p className="closing-quote">
                  "You don't need to figure it all out on your own anymore. You just need the right space, 
                  guidance, and momentum. This is it."
                </p>
                <p className="closing-invitation">
                  Join The Circle and let's start building the life you know you're meant for.
                </p>
                <p className="closing-ready">
                  You're not here by accident. You're ready — and this is your next step.
                </p>
                <p className="final-call">
                  Join me in The Circle of Return
                </p>
              </div>

            </div>
          </section>
        </main>
      </div>
    </>
  )
}
