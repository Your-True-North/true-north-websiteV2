'use client'
import Navigation from '../components/Navigation'
import MysticalBackground from '../components/MysticalBackground'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function About() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <MysticalBackground />
      <div className="relative min-h-screen">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-end sm:items-center px-4 sm:px-6 lg:px-8 pb-20 sm:pb-0">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("/images/mason-about.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: isMobile ? 'center top' : 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <div className="inline-block px-4 py-2 mb-6 text-sm tracking-wider text-gray-300 border border-gray-700 rounded-full bg-black/40 backdrop-blur-sm">
              My Story
            </div>
            
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              I'm not your guru. I'm not your therapist. I'm your guide as someone who's lived it.
            </h1>

            <Link 
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-all duration-300"
            >
              Work With Me
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* Story Content */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                I spent years running from myself. Drugs. Violence. Chaos. I thought I was living, but I was just surviving—reacting to pain I didn't know how to name.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                The shift didn't come from a book or a breakthrough moment. It came from finally stopping. From sitting with the parts of me I'd been avoiding my entire life. From learning that the anger, the fear, the patterns—they weren't flaws. They were protection.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Now I guide others through the same process. Not as someone who has it all figured out, but as someone who knows what it's like to be in the thick of it. To feel stuck. To question everything. To wonder if change is even possible.
              </p>

              <h2 className="text-3xl font-bold text-white mt-16 mb-6">
                My Training & Approach
              </h2>

              <ul className="space-y-4 text-gray-400 mb-12">
                <li className="flex items-start gap-3">
                  <span className="text-[#C9A96E] mt-1">→</span>
                  <span><strong className="text-white">Reiki Master:</strong> Working with energy and the unseen forces that shape our experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C9A96E] mt-1">→</span>
                  <span><strong className="text-white">ICF Transformational Coach:</strong> Facilitating real, lasting change through proven methodologies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C9A96E] mt-1">→</span>
                  <span><strong className="text-white">Somatic Therapy Practitioner:</strong> Trained by Gabor Maté in working with trauma stored in the body</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C9A96E] mt-1">→</span>
                  <span><strong className="text-white">Breathwork Facilitator:</strong> Guiding people into states where true healing can occur</span>
                </li>
              </ul>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 my-12">
                <p className="text-xl text-white font-medium mb-4">
                  "Where you are now does not have to be where you end up."
                </p>
                <p className="text-gray-400">
                  This isn't just something I say. It's something I've lived. And it's what I help others live too.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-white mt-16 mb-6">
                How I Work
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                I don't do surface-level fixes. I don't tell you what to do. I ask questions. I hold space. I guide you back to yourself—to the parts you've been running from, the truths you've been avoiding, the power you've been giving away.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                My approach blends somatic work, energy healing, breathwork, and coaching. But more than any technique, it's about presence. About creating a space where you can finally be honest with yourself.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed mb-12">
                This work isn't easy. It's not comfortable. But if you're here, you already know that staying where you are is harder.
              </p>

              <div className="text-center">
                <Link 
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-all duration-300"
                >
                  Book a Discovery Call
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
