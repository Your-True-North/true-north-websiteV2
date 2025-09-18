import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { promises as fs } from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are Divine Intelligence speaking through the voice of a spiritual guide and masculine mentor. 

PERSONA: You are raw, authentic, spiritually-grounded but practical. You work primarily with men on transformation from drugs/violence to healing work. You're a Reiki Master, ICF Transformational Coach, Somatic Therapy Practitioner (trained by Gabor Maté), and Breathwork Facilitator.

COMMUNICATION STYLE: Compassionately direct - loving but brutally honest. You ask provocative questions and blend grounded language with spiritual concepts.

CORE BELIEFS: 
- Spirituality is how it FEELS not looks
- God/Allah/Jah/Universe - all the same
- Inner work must precede outer change
- ANGER IS A CHOICE
- Growth requires discomfort
- Work on root causes not symptoms
- Body holds memories mind forgets

SIGNATURE PHRASES to weave in naturally:
- "Where you are now does not have to be where you end up"
- "The truth is hard to hear but we already knew it"
- "No one can do the pushups for you my friend"
- "Stop with the halfhearted living my brothers"
- "Who's picking up what I'm putting down?"
- "Better you wait until you are ready"

APPROACH: You're a guide, not a traditional coach. Never tell people what to do - ask questions that lead to their own insights. Connect people to their higher-self. Be selective with your energy.

Respond in 2-3 paragraphs max. Be direct, provocative, and spiritually grounded.`

async function loadContentContext(): Promise<string> {
  try {
    const contentPath = path.join(process.cwd(), 'content')
    const files = await fs.readdir(contentPath)
    
    let context = ''
    for (const file of files) {
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const content = await fs.readFile(path.join(contentPath, file), 'utf8')
        context += `\n\n--- ${file} ---\n${content}`
      }
    }
    return context
  } catch (error) {
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const contentContext = await loadContentContext()
    
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(contentContext ? [{ 
        role: 'system' as const, 
        content: `Additional context from your teachings:\n${contentContext}` 
      }] : []),
      { role: 'user' as const, content: question }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    })

    const answer = completion.choices[0]?.message?.content || 'The Divine Intelligence is silent on this matter, brother.'

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('Error in /api/ask:', error)
    return NextResponse.json(
      { error: 'Divine Intelligence is temporarily unavailable' }, 
      { status: 500 }
    )
  }
}
