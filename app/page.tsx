'use client'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import MysticalBackground from './components/MysticalBackground'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [recommendation, setRecommendation] = useState<'coaching' | 'circle' | 'library'>('library')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const questions = [
    {
      question: "What brings you here?",
      options: [
        { text: "I want to understand myself better", value: "library" },
        { text: "I'm ready for deep transformation", value: "coaching" },
        { text: "I want community support", value: "circle" }
      ]
    },
    {
      question: "Where are you in your journey?",
      options: [
        { text: "Just starting to explore", value: "library" },
        { text: "Ready to commit to change", value: "coaching" },
        { text: "Looking for ongoing support", value: "circle" }
      ]
    },
    {
      question: "What resonates most?",
      options: [
        { text: "Learning at my own pace", value: "library" },
        { text: "Direct guidance and accountability", value: "coaching" },
        { text: "Being part of something bigger", value: "circle" }
      ]
    }
  ]

  const handleAnswer = (value: 'coaching' | 'circle' | 'library') => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      const counts = newAnswers.reduce((acc, ans) => {
        acc[ans] = (acc[ans] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as 'coaching' | 'circle' | 'library'
      setRecommendation(mostFrequent)
      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResult(false)
  }

  const recommendations = {
    coaching: {
      title: "1:1 Transformational Coaching",
      description: "You're ready for deep, personalized work. Let's walk this path together.",
      cta: "Apply for Coaching",
      link: "/work"
    },
    circle: {
      title: "Circle of Return",
      description: "You're seeking community and ongoing support. Join the circle.",
      cta: "Join the Waitlist",
      link: "/circle"
    },
    library: {
      title: "Resource Library",
      description: "Start with foundational tools and practices. Explore at your own pace.",
      cta: "Access Library",
      link: "/library"
    }
  }

  return (
    <>
      <MysticalBackground />
      <div className="relative min-h-screen">
        <Navigation />
        
        {/* Hero Section with darker overlay */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url("/images/mason-hero.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/80"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-block px-4 py-2 mb-8 text-sm tracking-wider text-gray-300 border border-gray-700 rounded-full bg-black/40 backdrop-blur-sm">
              Transformational Inner Work
            </div>
            
            <h1 className="mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              How you're thinking, feeling and acting isn't{' '}
              <span 
                className="relative inline-block"
                style={{
                  background: shimmerPhase === 0 ? 'linear-gradient(90deg, #C9A96E 0%, #F4E5C3 50%, #C9A96E 100%)' :
                             shimmerPhase === 1 ? 'linear-gradient(90deg, #F4E5C3 0%, #C9A96E 50%, #F4E5C3 100%)' :
                             'linear-gradient(90deg, #C9A96E 0%, #F4E5C3 50%, #C9A96E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'background 1s ease'
                }}
              >
                random
              </span>
            </h1>
            
            <p className="mb-12 text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              It's protection. It's your truth showing itself in your behaviour, your emotions, your patterns — because it's never had the chance to be heard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/work"
                className="group px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
              >
                Start Your Journey
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/about"
                className="px-8 py-4 border border-gray-600 text-white font-medium rounded-md hover:bg-white/10 transition-all duration-300"
              >
                My Story
              </Link>
            </div>
          </div>
        </section>

        {/* Rest of the page content stays the same */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Where should you start?
              </h2>
              <p className="text-gray-400 text-lg">
                Answer a few questions to find your path
              </p>
            </div>

            {!showResult ? (
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-8 border border-zinc-800">
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#C9A96E] to-[#F4E5C3] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-8">
                  {questions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.value as 'coaching' | 'circle' | 'library')}
                      className="w-full p-6 text-left bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-[#C9A96E] rounded-lg transition-all duration-300 text-white"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-8 border border-zinc-800 text-center">
                <div className="mb-8">
                  <div className="inline-block p-4 bg-gradient-to-br from-[#C9A96E]/20 to-[#F4E5C3]/20 rounded-full mb-6">
                    <svg className="w-12 h-12 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {recommendations[recommendation].title}
                  </h3>
                  <p className="text-gray-400 text-lg mb-8">
                    {recommendations[recommendation].description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={recommendations[recommendation].link}
                    className="group px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {recommendations[recommendation].cta}
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <button
                    onClick={resetQuiz}
                    className="px-8 py-4 border border-zinc-700 text-white font-medium rounded-md hover:bg-white/10 transition-all duration-300"
                  >
                    Take Quiz Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
