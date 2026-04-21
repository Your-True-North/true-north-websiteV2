import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const BOTS = [
  { id: 'bot_joe',        name: 'Joe' },
  { id: 'bot_adam_right', name: 'Adam Right' },
  { id: 'bot_david',      name: 'David' },
  { id: 'bot_josh',       name: 'Josh' },
]

// Pool of realistic bot posts
const BOT_POSTS = [
  { category: 'Reflections', title: 'Something from this week', content: 'Had a moment this week that connected back to what came up in session three. Did not expect it to surface in a conversation at work but there it was. The pattern showing up somewhere I was not looking for it.' },
  { category: 'Reflections', title: 'The breathwork', content: 'Did the breathwork session again on my own this time. Different without the group but still something moved. I think I have been avoiding sitting with my breath for a long time without knowing that is what I was doing.' },
  { category: 'Reflections', title: 'A week in', content: 'Been doing this for a few weeks now and something has changed in how I respond at home. My partner noticed before I did. She asked what was different. I didn't have a clean answer but it's something.' },
  { category: 'Questions & Support', title: 'Resistance', content: 'Has anyone else hit a wall where they know what the work is asking of them but they just don't want to do it? Not avoidance exactly. More like a part of me knows the next thing and is refusing. Wondering if that is part of the process or something I need to push through.' },
  { category: 'Questions & Support', title: 'Integrating between sessions', content: 'What does the integration work actually look like for you in practice? I do the replay, I sit with it, but then the week runs away and I feel like I lose the thread. Curious what others are doing to keep it alive between calls.' },
  { category: 'Reflections', title: 'On the Chiron work', content: 'Went back to the astrology section and read the Chiron description again. The first time I was not ready to take it seriously. Second read was different. There is something in there about my relationship with my father that I have been sitting with since.' },
  { category: 'Reflections', title: 'The Hero Journey replay', content: 'Finally watched the full session. Three times I had to stop and come back to it. The part about the ordinary world and why we resist leaving it. I have been living in the ordinary world by choice, thinking it was safety. It's not.' },
]

// Pool of realistic bot replies
const BOT_REPLIES = [
  'That landed. I have had a version of that exact thing and never been able to name it until just now.',
  'I recognise what you are describing. The resistance is real. I think it is part of it, not a sign something is wrong.',
  'Appreciate you sharing that. It takes something to put this stuff into words.',
  'This is the work. The fact you are noticing is already different to before.',
  'I had a similar moment last week. It came out of nowhere and I was not ready for it.',
  'Good question. I have been wondering the same thing. Haven't got there yet.',
  'Watching the replay helped me with this. There is a section in session two that speaks directly to what you are describing.',
  'That is honest. I think a lot of men in here feel this but don't say it. Good that you did.',
  'The body work was the thing I resisted the most and the thing that moved me the most. Strange how that works.',
  'Sitting with this one. Thank you for posting it.',
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = await req.json().catch(() => ({ action: 'post' }))
  const bot = pickRandom(BOTS)

  if (action === 'reply') {
    // Reply to a random existing post
    const posts = await query('SELECT id FROM community_posts ORDER BY createdat DESC LIMIT 10')
    if (posts.rows.length === 0) return NextResponse.json({ error: 'No posts found' }, { status: 404 })
    const post = pickRandom(posts.rows)
    const content = pickRandom(BOT_REPLIES)
    await query(
      'INSERT INTO post_replies (post_id, "userId", content, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
      [post.id, bot.id, content]
    )
    return NextResponse.json({ ok: true, bot: bot.name, action: 'reply', postId: post.id })
  } else {
    // Create a new post
    const template = pickRandom(BOT_POSTS)
    await query(
      'INSERT INTO community_posts ("userId", category, title, content, createdat, updatedat) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [bot.id, template.category, template.title, template.content]
    )
    return NextResponse.json({ ok: true, bot: bot.name, action: 'post', title: template.title })
  }
}
