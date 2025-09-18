'use client'
import { useEffect } from 'react'

export default function MysticalBackground() {
  useEffect(() => {
    // Generate floating energy particles (reduced by 50%)
    function createParticles() {
      const container = document.querySelector('.mystical-background')
      if (!container) return
      
      const particleCount = 6  // Reduced from 12 to 6
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'energy-particle'
        
        // Random size variation
        const size = Math.random()
        if (size < 0.3) particle.classList.add('small')
        else if (size > 0.7) particle.classList.add('large')
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%'
        
        // Random delay for staggered animation
        particle.style.animationDelay = Math.random() * 20 + 's'
        
        container.appendChild(particle)
      }
    }

    // Initialize particles
    createParticles()

    // Add subtle mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const particles = document.querySelectorAll('.energy-particle')
      const mouseX = e.clientX
      const mouseY = e.clientY
      
      particles.forEach(particle => {
        const rect = (particle as HTMLElement).getBoundingClientRect()
        const particleX = rect.left + rect.width / 2
        const particleY = rect.top + rect.height / 2
        
        const distance = Math.sqrt(
          Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
        )
        
        if (distance < 80) {
          const angle = Math.atan2(particleY - mouseY, particleX - mouseX)
          const force = (80 - distance) / 80
          const offsetX = Math.cos(angle) * force * 15
          const offsetY = Math.sin(angle) * force * 15
          
          ;(particle as HTMLElement).style.transform = `translate(${offsetX}px, ${offsetY}px)`
        } else {
          ;(particle as HTMLElement).style.transform = 'translate(0, 0)'
        }
      })
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      // Clean up particles
      const particles = document.querySelectorAll('.energy-particle')
      particles.forEach(particle => particle.remove())
    }
  }, [])

  return (
    <div className="mystical-background">
      {/* Aurora Effect */}
      <div className="aurora"></div>
      
      {/* Sacred Geometry - Removed the big star, keeping only subtle circles */}
      <div className="sacred-geometry">
        <svg viewBox="0 0 200 200">
          {/* Just the subtle inner circles */}
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(123, 166, 155, 0.05)" strokeWidth="0.3"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(123, 166, 155, 0.06)" strokeWidth="0.3"/>
          <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(123, 166, 155, 0.04)" strokeWidth="0.3"/>
        </svg>
      </div>

      {/* Spiritual Symbols - Just a few, very subtle */}
      <div className="spiritual-symbol" style={{top: '25%', left: '12%', animationDelay: '0s'}}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          {/* Simple infinity symbol */}
          <path d="M6 12 Q9 6 12 12 Q15 18 18 12 Q15 6 12 12 Q9 18 6 12" 
                fill="none" stroke="rgba(123, 166, 155, 0.08)" strokeWidth="1"/>
        </svg>
      </div>

      <div className="spiritual-symbol" style={{top: '60%', right: '15%', animationDelay: '-4s'}}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          {/* Simple lotus petals */}
          <circle cx="12" cy="12" r="6" fill="none" stroke="rgba(123, 166, 155, 0.06)" strokeWidth="1"/>
          <circle cx="12" cy="12" r="3" fill="none" stroke="rgba(123, 166, 155, 0.08)" strokeWidth="1"/>
        </svg>
      </div>

      <div className="spiritual-symbol" style={{top: '40%', left: '85%', animationDelay: '-8s'}}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          {/* Simple mandala center */}
          <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(123, 166, 155, 0.05)" strokeWidth="0.8"/>
          <circle cx="12" cy="12" r="4" fill="none" stroke="rgba(123, 166, 155, 0.07)" strokeWidth="0.8"/>
        </svg>
      </div>

      {/* Energy Centers */}
      <div className="energy-center" style={{top: '15%', left: '15%'}}></div>
      <div className="energy-center" style={{top: '70%', left: '85%', animationDelay: '-1s'}}></div>
      <div className="energy-center" style={{top: '40%', left: '8%', animationDelay: '-2s'}}></div>
      <div className="energy-center" style={{top: '60%', left: '92%', animationDelay: '-3s'}}></div>
      
      {/* Energy Flow Lines - keeping these as you said lines are ok */}
      <div className="energy-flow" style={{left: '15%', animationDelay: '0s'}}></div>
      <div className="energy-flow" style={{left: '35%', animationDelay: '-2s'}}></div>
      <div className="energy-flow" style={{left: '55%', animationDelay: '-4s'}}></div>
      <div className="energy-flow" style={{left: '75%', animationDelay: '-6s'}}></div>
    </div>
  )
}
