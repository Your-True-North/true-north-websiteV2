# Ask True North Widget - AI Integration Setup

This guide will help you set up the "Ask True North" widget so it returns answers based on YOUR actual teachings and wisdom.

## 🎯 What This Does

The widget on your Library page allows visitors to ask questions and get answers that sound like YOU - based on your philosophy, teachings, and approach.

## 📋 Step-by-Step Setup

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-...`)
5. **Keep this key private!** Never share it or commit it to GitHub

**Cost**: OpenAI charges per API call. GPT-4 costs about $0.03 per 1K tokens (roughly $0.01-0.05 per question/answer). You can set spending limits in your OpenAI dashboard.

### 2. Add Your API Key to the Project

1. In your project root folder, create a file called `.env.local`
2. Add this line (replace with your actual key):
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file

**Important**: The `.env.local` file is already in `.gitignore`, so it won't be committed to GitHub. This keeps your key safe!

### 3. Add Your Teachings to the Knowledge Base

Open the file: `lib/mason-knowledge-base.ts`

Replace ALL the placeholder text with YOUR actual content:

#### What to Include:
- **Your core philosophy** - What you believe about transformation, growth, regulation
- **Your background** - Your journey, training, what makes you unique
- **Common themes** - The main topics you address (anger, relationships, purpose, etc.)
- **Your voice** - How you communicate (direct, grounded, body-focused, etc.)
- **Specific quotes** - Phrases and concepts you frequently use
- **Your approach** - How you answer common questions about anger, relationships, direction, etc.

#### Example:
```typescript
## Your Teaching Style & Voice
I'm direct and honest. I don't do spiritual bypassing or toxic positivity.
I meet men where they are and show them how to regulate their nervous system,
not just "think differently." My work is body-based - somatic practices,
breathwork, and energy healing. I teach men how to feel safe in their bodies
so they can show up differently in life.

## Specific Teachings & Wisdom
"I don't just talk mindset. I teach regulation."
"Where you are now does not have to be where you end up."
"The body keeps the score - and the body holds the solution."
"Real transformation happens when you commit and do the work."
```

**Pro Tip**: The MORE detail you provide, the better the AI can sound like you!

### 4. Test It Locally

1. Stop your development server if it's running (Ctrl+C)
2. Restart it: `npm run dev`
3. Go to your Library page
4. Click the "Ask True North" button
5. Ask a question related to your teachings
6. The answer should now come from AI based on your knowledge base!

### 5. Deploy to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key-here`
5. Click **Save**
6. Redeploy your site (or it will auto-deploy on next git push)

## 🔧 Advanced Options

### Want to use Claude instead of GPT-4?

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Update `app/api/ask-di/route.ts` to use the Anthropic API
3. Add `ANTHROPIC_API_KEY` to your `.env.local` instead

### Adjust AI Settings

In `app/api/ask-di/route.ts`, you can adjust:
- **model**: `'gpt-4'` (best quality) or `'gpt-3.5-turbo'` (cheaper/faster)
- **temperature**: `0.8` (creative) to `0.2` (consistent)
- **max_tokens**: `200` (concise) to `500` (longer answers)

### Question Limit

Currently set to 3 free questions per session. To change:
- Open `app/library/page.tsx`
- Find line 34: `if (questionCount >= 2)`
- Change `2` to your desired limit minus 1 (e.g., `4` for 5 questions)

## 🚨 Troubleshooting

### "The path you seek is already within you..." (fallback answer)
- This means the API call failed
- Check your API key is correct in `.env.local`
- Check you have credits in your OpenAI account
- Look at the console logs for error messages

### AI answers don't sound like you
- Add more detail to your knowledge base
- Include more specific examples of your language/phrases
- Add examples of how you'd answer specific types of questions

### API costs getting high
- Switch from `gpt-4` to `gpt-3.5-turbo` (10x cheaper)
- Reduce `max_tokens` to make answers shorter
- Reduce the free question limit

## 📝 Files You Created/Modified

- `.env.local.example` - Template showing what environment variables you need
- `lib/mason-knowledge-base.ts` - **YOUR CONTENT GOES HERE**
- `app/api/ask-di/route.ts` - API endpoint that calls OpenAI
- `app/library/page.tsx` - Frontend updated to use real API responses

## 🎉 You're Done!

Your "Ask True North" widget now returns answers based on YOUR teachings, in YOUR voice, powered by AI.

The more you refine your knowledge base, the better the answers will be!
