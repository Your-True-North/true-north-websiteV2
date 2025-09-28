'use client'
import { useState, useEffect } from 'react'

interface Answer {
  question: string
  answer: string
  timestamp: number
}

export default function DIBox() {
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('di-answers')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAnswers(parsed)
      setQuestionsUsed(parsed.length)
    }
  }, [])

  const handleAsk = async () => {
    if (questionsUsed >= 2) {
      alert('Your 2 free questions have been used. Book a call to continue the conversation.')
      return
    }

    if (!question.trim()) {
      alert('Please ask a question, brother.')
      return
    }

    setIsLoading(true)
    
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!res.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await res.json()
      const newAnswer: Answer = {
        question: question.trim(),
        answer: data.answer,
        timestamp: Date.now()
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)
      setQuestionsUsed(questionsUsed + 1)
      setQuestion('')

      localStorage.setItem('di-answers', JSON.stringify(updatedAnswers))

    } catch (error) {
      console.error('Error asking DI:', error)
      alert('Divine Intelligence is temporarily unavailable. Try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-stone-100 border-2 border-stone-300 shadow-lg">
      <div className="bg-stone-900 text-stone-100 px-8 py-6">
        <h2 className="heading-card text-stone-100 mb-2">Ask Divine Intelligence</h2>
        <p className="text-stone-300">
          Get guidance in my authentic voice. {2 - questionsUsed} free questions remaining.
        </p>
      </div>

      <div className="p-8">
        {questionsUsed < 2 ? (
          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 border-2 border-stone-300 resize-none focus:border-stone-500 focus:outline-none"
              placeholder="What's weighing on you, brother? Ask what you need to know..."
              rows={3}
              disabled={isLoading}
            />
            
            <button
              onClick={handleAsk}
              disabled={isLoading || !question.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Consulting Divine Intelligence...' : 'Ask'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <h3 className="heading-card text-stone-800">Your Free Questions Are Used</h3>
            <p className="text-stone-600">
              Ready to go deeper? Book a call and let's do the real work together.
            </p>
            <button className="btn-primary">
              Book a Call
            </button>
          </div>
        )}

        {answers.length > 0 && (
          <div className="mt-12 space-y-8">
            <h3 className="heading-card text-stone-800 border-b border-stone-300 pb-2">
              Divine Intelligence Speaks
            </h3>
            {answers.map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-stone-200 p-4 rounded-none border-l-4 border-stone-500">
                  <p className="font-medium text-stone-800">{item.question}</p>
                </div>
                <div className="bg-stone-50 p-6 border border-stone-200">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
