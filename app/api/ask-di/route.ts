import { systemPrompt } from '@/lib/mason-knowledge-base';

export async function POST(req: Request) {
  try {
    const { q: question } = await req.json();

    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({
          answer: "The path you seek is already within you. Trust the process. Where you are now does not have to be where you end up.",
          fallback: true
        }),
        { headers: { "content-type": "application/json" } }
      );
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.8,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || "Trust the process. Where you are now does not have to be where you end up.";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { "content-type": "application/json" } }
    );

  } catch (error) {
    console.error('Ask DI error:', error);
    return new Response(
      JSON.stringify({
        answer: "The path you seek is already within you. Trust the process. Where you are now does not have to be where you end up.",
        fallback: true
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
}
