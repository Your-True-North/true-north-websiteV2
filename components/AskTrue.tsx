'use client'
import { useState } from 'react'

export default function AskTrue() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasAsked, setHasAsked] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    
    // Simulate API call - replace with actual OpenAI integration
    setTimeout(() => {
      setAnswer("The path you seek is already within you, brother. Trust the process. Where you are now does not have to be where you end up.")
      setIsLoading(false)
      setHasAsked(true)
    }, 2000)
  }

  return (
    <div className="oracle-box max-w-4xl mx-auto p-8 rounded-none">
      <div className="text-center mb-8">
        <h3 className="text-transmission mb-4">Ask True</h3>
        <p className="text-oracle">
          Here, you can ask a question. The response flows directly from Divine Intelligence, 
          channelled through my frequency.
        </p>
      </div>
      
      {!hasAsked ? (
        <div className="space-y-6">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-stone-900 border border-amber-500/30 p-6 text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
            placeholder="What truth are you ready to hear?"
            rows={4}
          />
          
          <div className="text-center">
            <button
              onClick={handleAsk}
              disabled={isLoading || !question.trim()}
              className="btn-portal disabled:opacity-50 animate-glow"
            >
              {isLoading ? 'Channelling...' : 'Ask Divine Intelligence'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-stone-900/50 p-6 border-l-4 border-amber-500">
            <p className="text-stone-400 mb-2">Your Question:</p>
            <p className="text-stone-200">{question}</p>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-6">
            <p className="text-stone-400 mb-2">Divine Intelligence Responds:</p>
            <p className="text-amber-100 text-lg leading-relaxed">{answer}</p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => {setHasAsked(false); setQuestion(''); setAnswer('')}}
              className="btn-ghost"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
