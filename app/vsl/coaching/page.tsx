'use client'
import { useState, useRef } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import MysticalBackground from '../../components/MysticalBackground'

export default function CoachingVSL() {
  const [activeTab, setActiveTab] = useState<'watch' | 'read'>('watch')
  const readSectionRef = useRef<HTMLDivElement>(null)

  const scrollToContent = () => {
    if (readSectionRef.current) {
      readSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const whatsappNumber = "+447449052909"
  const whatsappMessage = "Hi Mason, I've watched your 1:1 coaching video and I'm ready to book a discovery call. I understand this is deep transformation work and I'm prepared to invest in myself."

  return (
    <>
      <MysticalBackground />
      <Navigation />
      
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Warning Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-lg px-6 py-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-300 font-medium">Before You Book That Call</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
              Please Watch This First
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              This work isn't for everyone. Make sure you understand what you're signing up for.
            </p>
          </div>

          {/* Watch/Read Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-black/40 rounded-lg p-2 border border-orange-500/20">
              <button
                onClick={() => setActiveTab('watch')}
                className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeTab === 'watch'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Watch Video
              </button>
              <button
                onClick={() => {
                  setActiveTab('read')
                  scrollToContent()
                }}
                className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeTab === 'read'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Read Instead
              </button>
            </div>
          </div>

          {/* Video Section */}
          {activeTab === 'watch' && (
            <div className="mb-16">
              <div className="bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 rounded-xl p-8 border border-orange-500/20">
                <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center border border-red-500/30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-500/50">
                      <div className="w-8 h-8 border-l-4 border-red-400 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-red-300 text-sm">Video placeholder - Upload your VSL here</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-orange-200 mb-4">Record your 5-7 minute VSL covering:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-orange-300 font-semibold mb-2">Your Transformation</h4>
                      <p className="text-gray-300 text-sm">From drugs/violence to healing work</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-orange-300 font-semibold mb-2">Who This Is For</h4>
                      <p className="text-gray-300 text-sm">And who it's definitely not for</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-orange-300 font-semibold mb-2">Your Approach</h4>
                      <p className="text-gray-300 text-sm">Somatic, breathwork, energy work</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-orange-300 font-semibold mb-2">Set Expectations</h4>
                      <p className="text-gray-300 text-sm">What the discovery call involves</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Read Section */}
          {activeTab === 'read' && (
            <div ref={readSectionRef} className="mb-16">
              <div className="bg-gradient-to-br from-red-900/10 via-orange-900/10 to-yellow-900/10 rounded-xl p-8 border border-orange-500/20 backdrop-blur-sm">
                
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-orange-300 mb-6 text-center">
                    This Isn't Life Coaching
                  </h2>
                  <div className="prose prose-lg prose-invert max-w-none">
                    <p className="text-gray-200 leading-relaxed mb-6">
                      Let me be clear from the start: this work is not for everyone. If you're looking for someone to tell you what you want to hear, or help you rearrange the deck chairs on your sinking ship, I'm not your guy.
                    </p>
                    
                    <p className="text-gray-200 leading-relaxed mb-6">
                      I work with people who are ready to face the truth about themselves. The uncomfortable truth. The truth that lives in your body, in your patterns, in the places you've been avoiding.
                    </p>
                  </div>
                </div>

                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-red-400 mb-6">
                    My Background - Why I Can Help You
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-black/20 rounded-lg p-6">
                      <h4 className="text-orange-300 font-semibold mb-3">Lived Experience</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        I've walked through the fire myself. Drugs, violence, the whole dark path. I know what rock bottom feels like, and I know the way back up.
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-6">
                      <h4 className="text-orange-300 font-semibold mb-3">Professional Training</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Reiki Master, ICF Transformational Coach, Somatic Therapy Practitioner (trained by Gabor Maté), Breathwork Facilitator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6">
                    The Three Phases of This Work
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-red-900/30 to-transparent rounded-lg p-6 border-l-4 border-red-500">
                      <h4 className="text-red-300 font-bold text-lg mb-3">Phase 1: Reality Check</h4>
                      <p className="text-gray-200">
                        We strip away the stories you've been telling yourself. No more spiritual bypassing. No more pretending everything is fine. We look at what's actually happening in your life.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-900/30 to-transparent rounded-lg p-6 border-l-4 border-orange-500">
                      <h4 className="text-orange-300 font-bold text-lg mb-3">Phase 2: Body Work</h4>
                      <p className="text-gray-200">
                        Your body holds everything your mind has forgotten. Through somatic work, breathwork, and energy healing, we release what's been stuck. This isn't comfortable.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-900/30 to-transparent rounded-lg p-6 border-l-4 border-yellow-500">
                      <h4 className="text-yellow-300 font-bold text-lg mb-3">Phase 3: Integration</h4>
                      <p className="text-gray-200">
                        Now we build something new. Not the old you with fresh paint, but a fundamentally different way of being. This is where the real transformation happens.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                    <h3 className="text-red-300 font-bold text-xl mb-4">This Work Is NOT For You If:</h3>
                    <ul className="text-gray-200 space-y-2">
                      <li>• You want someone to validate your victim stories</li>
                      <li>• You're looking for quick fixes or magic bullets</li>
                      <li>• You're not ready to take responsibility for your life</li>
                      <li>• You want to stay comfortable in your patterns</li>
                      <li>• You're seeking a spiritual guru to follow</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-green-300 font-bold text-xl mb-4">This Work IS For You If:</h3>
                    <ul className="text-gray-200 space-y-2">
                      <li>• You're tired of your own patterns and ready for real change</li>
                      <li>• You understand that transformation requires discomfort</li>
                      <li>• You're willing to feel what you've been avoiding</li>
                      <li>• You want to do the work, not just talk about it</li>
                      <li>• You're ready to take full responsibility for your healing</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-black/40 rounded-lg p-6 border border-orange-500/30">
                    <p className="text-lg text-orange-200 mb-4">
                      "Where you are now does not have to be where you end up"
                    </p>
                    <p className="text-gray-300 text-sm">
                      But only you can do the pushups, my friend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-red-900/30 via-orange-900/30 to-yellow-900/30 rounded-xl p-8 border border-orange-500/30">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready for the Discovery Call?
              </h2>
              
              <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
                This is a 30-minute conversation where we'll determine if we're aligned for this work. I'm selective about who I work with, and you should be selective about who you work with too.
              </p>
              
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Request Discovery Call
              </a>
              
              <p className="text-sm text-gray-400 mt-4">
                Response within 24 hours • WhatsApp message
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </>
  )
}